
import { executeQuery } from './src/config/db';

async function testFetch() {
    console.log('--- Testing Structures Fetch ---');
    try {
        // Test RoW
        const row = await executeQuery(`
            SELECT TOP 5 r.RequestID, rr.LocalGovernmentArea
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
        `);
        console.log('RoW Raw Sample:', row);

        // Test Mast
        const mast = await executeQuery(`
            SELECT TOP 5 r.RequestID, tm.LocalGovernmentArea
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
        `);
        console.log('Mast Raw Sample:', mast);

    } catch (err: any) {
        console.error('FETCH ERROR:', err.message);
    }
}

testFetch();
