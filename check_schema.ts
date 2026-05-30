
import { executeQuery } from './src/config/db';

async function checkSchema() {
    const tables = ['LASIMRA_Request_SMO', 'LASIMRA_RowRequest_SMO', 'LASIMRA_TowerMast_Reqeust_SMO'];
    for (const table of tables) {
        try {
            console.log(`\n--- Columns for ${table} ---`);
            const r = await executeQuery(`SELECT TOP 1 * FROM [SmartBoxData].[${table}]`);
            if (r && r.length > 0) {
                console.log(Object.keys(r[0]).join(', '));
            } else {
                console.log('No data found in table.');
            }
        } catch (err: any) {
            console.log(`Error checking status for ${table}: ${err.message}`);
        }
    }
}

checkSchema();
