import axios from 'axios';

async function testAPIs() {
    const endpoints = [
        'http://localhost:3000/api/geo/lgas',
        'http://localhost:3000/api/payments?limit=5',
        'http://localhost:3000/api/payments/trend'
    ];

    for (const url of endpoints) {
        console.log(`\nTesting: ${url}`);
        try {
            const resp = await axios.get(url);
            console.log(`Status: ${resp.status}`);
            console.log('Data:', JSON.stringify(resp.data, null, 2).slice(0, 300) + '...');
        } catch (err: any) {
            console.error(`ERROR: ${err.message}`);
            if (err.response) {
                console.error(`Response: ${JSON.stringify(err.response.data, null, 2)}`);
            }
        }
    }
}

testAPIs();
