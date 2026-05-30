
import { executeQuery } from './src/config/db';

async function test() {
    try {
        console.log('--- TESTING TOWER/MAST DATA ---');
        const towers = await executeQuery(`
            SELECT TOP 5 r.RequestID, r.RequestTitle, r.ApplicationDate
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
        `);
        console.log('Tower Result:', JSON.stringify(towers, null, 2));

        console.log('\n--- TESTING ROW DATA ---');
        const rows = await executeQuery(`
            SELECT TOP 5 r.RequestID, r.RequestTitle, r.ApplicationDate, rr.LocalGovernmentArea
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
        `);
        console.log('RoW Result:', JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('ERROR:', err);
    }
}

test();
