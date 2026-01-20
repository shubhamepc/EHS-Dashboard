const API_URL = 'http://localhost:5000/api';

async function checkSafetyScore() {
    try {
        // Login as Admin
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        // Fetch Safety Scores
        console.log('Fetching Safety Scores...');
        const res = await fetch(`${API_URL}/analytics/safety-scores`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) {
            console.error('Error Status:', res.status);
            console.error('Error Body:', data);
        } else {
            console.log('Success:', data);
        }

    } catch (error) {
        console.error('Request failed:', error);
    }
}

checkSafetyScore();
