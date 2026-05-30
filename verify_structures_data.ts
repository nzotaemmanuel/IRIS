
import { executeQuery } from './src/config/db';

async function verify() {
    console.log('--- Verifying Structures Data ---');
    try {
        const stats = await executeQuery(`
            SELECT COUNT(r.RequestID) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
        `);
        console.log('RoW Count:', stats[0]?.count);

        const tmStats = await executeQuery(`
            SELECT COUNT(r.RequestID) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
        `);
        console.log('Tower/Mast Count:', tmStats[0]?.count);

        const samples = await executeQuery(`
            SELECT TOP 2 r.RequestID, r.RequestTitle
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
        `);
        console.log('Samples:', JSON.stringify(samples, null, 2));

    } catch (err: any) {
        console.error('Verification Error:', err.message);
    }
}

verify();
