
import { executeQuery } from './src/config/db';

async function verify() {
    console.log('--- Final Status Check ---');
    try {
        const row = await executeQuery(`
            SELECT TOP 1 r.RequestID, rr.LocalGovernmentArea 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
        `);
        console.log('RoW Join Success:', row.length > 0);

        const mast = await executeQuery(`
            SELECT TOP 1 r.RequestID, tm.LocalGovernmentArea 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
        `);
        console.log('Mast Join Success:', mast.length > 0);

        if (row.length > 0) console.log('RoW Sample RequestID:', row[0].RequestID);
        if (mast.length > 0) console.log('Mast Sample RequestID:', mast[0].RequestID);

    } catch (err: any) {
        console.error('Final Check Error:', err.message);
    }
}

verify();
