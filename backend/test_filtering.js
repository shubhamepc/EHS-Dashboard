const API_URL = 'http://localhost:5000/api';

async function testProjectFiltering() {
    try {
        // 1. Login as Manager
        console.log('Logging in as Manager...');
        const managerLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'manager', password: 'password' })
        });
        const managerData = await managerLoginRes.json();

        if (!managerLoginRes.ok) throw new Error(JSON.stringify(managerData));

        const managerToken = managerData.token;
        console.log('Manager logged in.');

        // 2. Fetch Projects as Manager
        console.log('Fetching projects as Manager...');
        const managerProjectsRes = await fetch(`${API_URL}/projects`, {
            headers: { Authorization: `Bearer ${managerToken}` }
        });
        const managerProjects = await managerProjectsRes.json();
        console.log(`Manager sees ${managerProjects.length} projects:`);
        console.table(managerProjects.map(p => ({ id: p.id, name: p.name, manager: p.site_manager_name })));

        // 3. Login as Admin
        console.log('\nLogging in as Admin...');
        const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password' })
        });
        const adminData = await adminLoginRes.json();
        const adminToken = adminData.token;
        console.log('Admin logged in.');

        // 4. Fetch Projects as Admin
        console.log('Fetching projects as Admin...');
        const adminProjectsRes = await fetch(`${API_URL}/projects`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const adminProjects = await adminProjectsRes.json();
        console.log(`Admin sees ${adminProjects.length} projects:`);
        console.table(adminProjects.map(p => ({ id: p.id, name: p.name, manager: p.site_manager_name })));

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testProjectFiltering();
