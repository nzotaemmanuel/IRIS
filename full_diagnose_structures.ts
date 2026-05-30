
import { executeQuery } from './src/config/db';

async function fullDiagnose() {
    console.log('--- Comprehensive Structures Diagnosis ---');
    try {
        // 1. Check Columns of all 3 tables
        const tables = ['LASIMRA_Request_SMO', 'LASIMRA_RowRequest_SMO', 'LASIMRA_TowerMast_Reqeust_SMO'];
        for (const table of tables) {
            const cols = await executeQuery(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
            console.log(`\nTable: ${table}`);
            console.log(`Columns: ${cols.map((c: any) => c.COLUMN_NAME).join(', ')}`);
        }

        // 2. Check Sample Data and specific join values
        console.log('\n--- Sample Join Data (RoW) ---');
        const rowJoin = await executeQuery(`
            SELECT TOP 5 r.RequestID, r.LocalGovernmentArea_, rr.LocalGovernmentArea
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
        `);
        console.log('RoW Joins:', JSON.stringify(rowJoin, null, 2));

        // 3. Test the exact List Query (minimally)
        console.log('\n--- Test RoW List Query ---');
        const rowList = await executeQuery(`
            SELECT TOP 5
                r.RequestID,
                r.RequestTitle,
                r.ApplicationDate,
                r.LocalGovernmentArea_
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
        `);
        console.log('RoW List Results:', JSON.stringify(rowList, null, 2));

    } catch (err: any) {
        console.error('DIAGNOSIS ERROR:', err.message);
    }
}

fullDiagnose();
