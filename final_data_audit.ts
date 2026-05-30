
import { executeQuery } from './src/config/db';

async function finalAudit() {
    console.log('--- Structures Data Integrity Audit ---');
    try {
        const reqTableSample = await executeQuery("SELECT TOP 3 * FROM [SmartBoxData].[LASIMRA_Request_SMO]");
        const mastTableSample = await executeQuery("SELECT TOP 3 * FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]");
        const rowTableSample = await executeQuery("SELECT TOP 3 * FROM [SmartBoxData].[LASIMRA_RowRequest_SMO]");

        console.log('Request Table Columns discovered:', Object.keys(reqTableSample[0] || {}));
        console.log('Mast Table Columns discovered:', Object.keys(mastTableSample[0] || {}));
        console.log('Row Table Columns discovered:', Object.keys(rowTableSample[0] || {}));

        console.log('\nSample RequestID from Request table:', reqTableSample.map((r: any) => r.RequestID || r.ID));
        console.log('Sample RequestID from Mast table:', mastTableSample.map((r: any) => r.RequestID));
        console.log('Sample RequestID from Row table:', rowTableSample.map((r: any) => r.RequestID));

        const joinTest = await executeQuery(`
            SELECT TOP 5 r.RequestID as ReqID, tm.RequestID as SubID
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
        `);
        console.log('\nJoin Result Sample (Request ↔ Mast):', joinTest);

    } catch (err: any) {
        console.error('AUDIT ERROR:', err.message);
    }
}

finalAudit();
