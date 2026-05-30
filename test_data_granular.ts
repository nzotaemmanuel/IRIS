
import { executeQuery } from './src/config/db';

async function test() {
    console.log('--- STARTING GRANULAR DATA TEST ---');
    
    // Test 1: Base table columns
    try {
        console.log('\nTesting LASIMRA_Request_SMO columns...');
        const r1 = await executeQuery('SELECT TOP 1 * FROM [SmartBoxData].[LASIMRA_Request_SMO]');
        console.log('Request Columns:', Object.keys(r1[0]).join(', '));
    } catch (e: any) {
        console.error('Request table error:', e.message);
    }

    // Test 2: Tower table columns
    try {
        console.log('\nTesting LASIMRA_TowerMast_Reqeust_SMO columns...');
        const r2 = await executeQuery('SELECT TOP 1 * FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]');
        console.log('Tower Columns:', Object.keys(r2[0]).join(', '));
    } catch (e: any) {
        console.error('Tower table error:', e.message);
    }

    // Test 3: Join with ID
    try {
        console.log('\nTesting Tower Join with r.ID...');
        const r3 = await executeQuery(`
            SELECT TOP 1 r.ID, tm.RequestID
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.ID = tm.RequestID
        `);
        console.log('Join Success! Data:', r3[0]);
    } catch (e: any) {
        console.error('Join error (r.ID):', e.message);
    }

    // Test 4: Join with RequestID (original potentially wrong one)
    try {
        console.log('\nTesting Tower Join with r.RequestID...');
        const r4 = await executeQuery(`
            SELECT TOP 1 r.RequestID, tm.RequestID
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
        `);
        console.log('Join Success (r.RequestID)! Data:', r4[0]);
    } catch (e: any) {
        console.error('Join error (r.RequestID):', e.message);
    }
}

test();
