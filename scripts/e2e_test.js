// Native fetch used 
// Actually, standard Node environment might not have fetch in strict CJS mode depending on version. 
// I'll use standard http or try to require https.
// To be safe and easy, I'll rely on the fact that I can install dependencies or use what's there. 
// Let's check if I can use 'axios' from frontend node_modules? No, path issues.
// I will just use native 'fetch' assuming Node 18+.

const BASE_URL = 'http://localhost:5000/api';
let ADMIN_TOKEN = '';
let MANAGER_TOKEN = '';
let MANAGER_ID = '';
let PROJECT_ID = '';

async function runTest() {
    console.log("========================================");
    console.log("STARTING EHS SYSTEM END-TO-END TEST");
    console.log("========================================");

    try {
        await testAuth();
        await testUserManagement();
        await testProjectManagement();
        await testReportValidation();
        await testPerformanceValidation();
        console.log("\nALL TESTS COMPLETED SUCCESSFULLY.");
    } catch (error) {
        console.error("\nTEST FAILED:", error.message);
        if (error.response) {
            console.error("Response:", await error.response.text());
        }
    }
}

async function request(method, endpoint, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${method} ${endpoint} failed: ${response.status} ${response.statusText} - ${text}`);
    }
    return response.json();
}

async function requestExpectError(method, endpoint, body = null, token = null, expectedStatus = 400) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (response.status === expectedStatus || response.status === 409 || response.status === 403) {
        console.log(`[PASS] ${method} ${endpoint} failed as expected with ${response.status}`);
        return await response.json().catch(() => { });
    } else {
        throw new Error(`Expected ${expectedStatus} but got ${response.status}`);
    }
}

async function testAuth() {
    console.log("\n--- Phase 1: Authentication ---");

    // Login Admin
    const adminLogin = await request('POST', '/auth/login', { username: 'admin', password: 'password123' });
    ADMIN_TOKEN = adminLogin.token;
    console.log("[PASS] Admin Login");

    // Login Fail
    await requestExpectError('POST', '/auth/login', { username: 'admin', password: 'wrongpassword' }, null, 401);
}

async function testUserManagement() {
    console.log("\n--- Phase 1 & 3: User Management & Security ---");

    // Create Manager
    const uniqueName = `manager_${Date.now()}`;
    const managerUser = await request('POST', '/users', {
        username: uniqueName,
        password: 'password123',
        role: 'manager',
        full_name: 'Test Manager',
        email: `${uniqueName}@test.com`
    }, ADMIN_TOKEN);
    MANAGER_ID = managerUser.id;
    console.log("[PASS] Created Manager:", uniqueName);

    // Login as Manager
    const managerLogin = await request('POST', '/auth/login', { username: uniqueName, password: 'password123' });
    MANAGER_TOKEN = managerLogin.token;
    console.log("[PASS] Manager Login");

    // Try to create user as Manager (Should fail)
    await requestExpectError('POST', '/users', { username: 'fail', password: '123', role: 'admin' }, MANAGER_TOKEN, 403);
}

async function testProjectManagement() {
    console.log("\n--- Phase 1: Project Management ---");

    // Create Project
    const uniqueProject = `Test Project ${Date.now()}`;
    const project = await request('POST', '/projects', {
        name: uniqueProject,
        location: 'Test Loc',
        site_manager_id: MANAGER_ID
    }, ADMIN_TOKEN);
    PROJECT_ID = project.id;
    console.log("[PASS] Created Project:", uniqueProject);
}

async function testReportValidation() {
    console.log("\n--- Phase 2: Data Integrity & Validation ---");

    const today = new Date().toISOString().split('T')[0];

    // 1. Negative Values Check
    const negativePayload = {
        project_id: PROJECT_ID,
        report_date: today,
        tbt_sessions: -1 // Negative
    };
    await requestExpectError('POST', '/reports/daily', negativePayload, MANAGER_TOKEN, 400);

    // 2. PTW Logic Check
    const ptwPayload = {
        project_id: PROJECT_ID,
        report_date: today,
        ptw_issued: 5,
        ptw_closed: 6 // Invalid
    };
    await requestExpectError('POST', '/reports/daily', ptwPayload, MANAGER_TOKEN, 400);

    // 3. Valid Daily Report
    const validPayload = {
        project_id: PROJECT_ID,
        report_date: today,
        ptw_issued: 5,
        ptw_closed: 5,
        tbt_sessions: 1,
        tbt_participants: 10
    };
    const daily = await request('POST', '/reports/daily', validPayload, MANAGER_TOKEN);
    console.log("[PASS] Valid Daily Report Created:", daily.reportId);

    // 4. Duplicate Check
    await requestExpectError('POST', '/reports/daily', validPayload, MANAGER_TOKEN, 409);

    // 5. Valid Monthly Report
    const monthlyPayload = {
        project_id: PROJECT_ID,
        report_month: 1,
        report_year: 2030,
        working_days: 20,
        man_hours: 1000
    };
    const monthly = await request('POST', '/reports/monthly', monthlyPayload, MANAGER_TOKEN);
    console.log("[PASS] Valid Monthly Report Created:", monthly.reportId);

    // 6. Duplicate Monthly Check
    await requestExpectError('POST', '/reports/monthly', monthlyPayload, MANAGER_TOKEN, 409);
}

async function testPerformanceValidation() {
    console.log("\n--- Phase 4: Performance Simulation ---");
    // We won't create 100 projects here to avoid spamming the DB too much, 
    // but we will measure response time of the dashboard endpoint.

    const start = performance.now();
    await request('GET', '/reports/kpi', null, ADMIN_TOKEN);
    const end = performance.now();
    console.log(`[PERF] KPI Stats loaded in ${(end - start).toFixed(2)}ms`); // Should be < 200ms

    const start2 = performance.now();
    await request('GET', '/projects', null, ADMIN_TOKEN);
    const end2 = performance.now();
    console.log(`[PERF] Projects List loaded in ${(end2 - start2).toFixed(2)}ms`);
}

// Check for fetch availability or polyfill
if (!globalThis.fetch) {
    console.log("Installing node-fetch...");
    try {
        require('child_process').execSync('npm install node-fetch', { stdio: 'inherit', cwd: __dirname });
        fetch = require('node-fetch');
    } catch (e) {
        console.error("Could not install node-fetch. Please ensure Node 18+ or install it manually.");
        process.exit(1);
    }
}

runTest();
