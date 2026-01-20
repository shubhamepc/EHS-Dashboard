const API_URL = 'http://localhost:5000/api';

async function testProjectFiltering() {
    try {
        // 1. Login as Manager
        const managerLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'manager', password: 'password' })
        });
        const managerData = await managerLoginRes.json();
        const managerToken = managerData.token;

        // 2. Fetch Projects as Manager
        const managerProjectsRes = await fetch(`${API_URL}/projects`, {
            headers: { Authorization: `Bearer ${managerToken}` }
        });
        const managerProjects = await managerProjectsRes.json();
        console.log(`Manager sees ${managerProjects.length} projects.`);

        // 3. Login as Admin
        const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password' })
        });
        const adminData = await adminLoginRes.json();
        const adminToken = adminData.token;

        // 4. Fetch Projects as Admin
        const adminProjectsRes = await fetch(`${API_URL}/projects`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const adminProjects = await adminProjectsRes.json();
        console.log(`Admin sees ${adminProjects.length} projects.`);

        if (managerProjects.length === adminProjects.length) {
            console.log("WARNING: Counts are equal. Does manager own all projects?");
        } else {
            console.log("SUCCESS: Counts differ, filtering is likely active.");
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testProjectFiltering();
