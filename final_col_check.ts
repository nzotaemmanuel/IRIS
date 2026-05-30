
import { executeQuery } from './src/config/db';

async function finalColumnCheck() {
    const tables = ['LASIMRA_Request_SMO', 'LASIMRA_RowRequest_SMO', 'LASIMRA_TowerMast_Reqeust_SMO'];
    console.log('--- Final Comprehensive Column Check ---');
    for (const table of tables) {
        try {
            const cols = await executeQuery(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = @table
            `, { table });
            console.log(`\nTable: ${table}`);
            console.log(`Columns: ${cols.map((c: any) => c.COLUMN_NAME).join(', ')}`);
        } catch (err: any) {
            console.error(`Error checking ${table}:`, err.message);
        }
    }
}

finalColumnCheck();
