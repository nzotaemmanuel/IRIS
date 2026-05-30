
import { executeQuery } from './src/config/db';

async function test() {
    try {
        console.log('--- TESTING TOWER/MAST DATA ---');
        const towers = await executeQuery(`
            SELECT TOP 5 r.ID, r.RequestTitle, r.ApplicationDate, r.LocalGovernmentArea_
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.ID = tm.RequestID
        `);
        console.log('Tower Result:', JSON.stringify(towers, null, 2));

        console.log('\n--- TESTING ROW DATA ---');
        const rows = await executeQuery(`
            SELECT TOP 5 r.ID, r.RequestTitle, r.ApplicationDate, r.LocalGovernmentArea_
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.ID = rr.RequestID
        `);
        console.log('RoW Result:', JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('ERROR:', err);
    }
}

test();
