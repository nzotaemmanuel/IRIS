
import { executeQuery } from './src/config/db';

async function listAllCols() {
    try {
        const tables = ['LASIMRA_Request_SMO', 'LASIMRA_RowRequest_SMO', 'LASIMRA_TowerMast_Reqeust_SMO'];
        for (const table of tables) {
            console.log(`--- Columns for ${table} ---`);
            const cols = await executeQuery(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table`, { table });
            console.log(cols.map((c: any) => c.COLUMN_NAME).join(', '));
        }
    } catch (err: any) {
        console.error('Error fetching columns:', err.message);
    }
}

listAllCols();
