
import { executeQuery } from './src/config/db';

async function checkData() {
    const tables = [
        '[SmartBoxData].[LASIMRA_Request_SMO]',
        '[SmartBoxData].[LASIMRA_RowRequest_SMO]',
        '[SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]'
    ];

    for (const table of tables) {
        try {
            console.log(`\n--- TABLE: ${table} ---`);
            const countRes = await executeQuery(`SELECT COUNT(*) as total FROM ${table}`);
            console.log(`Total Rows: ${countRes[0].total}`);

            const sampleRes = await executeQuery(`SELECT TOP 1 * FROM ${table}`);
            if (sampleRes && sampleRes.length > 0) {
                console.log(`Columns: ${Object.keys(sampleRes[0]).join(', ')}`);
                console.log(`Sample Data:`, JSON.stringify(sampleRes[0], null, 2));
            } else {
                console.log(`Table is EMPTY.`);
            }
        } catch (err: any) {
            console.error(`Error checking ${table}:`, err.message);
        }
    }
}

checkData();
