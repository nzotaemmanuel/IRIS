import { executeQuery } from './src/config/db.js';

async function listColumns() {
    const tables = [
        'LASIMRA_Payment_SMO',
        'LASIMRA_Request_SMO',
        'LASIMRA_TowerMastDetails_SMO',
        'LASIMRA_CustomerDetails_SMO'
    ];

    for (const table of tables) {
        console.log(`--- Columns for ${table} ---`);
        try {
            const result = await executeQuery(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table}'
            `);
            console.log(result.map(r => r.COLUMN_NAME).join(', '));
        } catch (err) {
            console.error(`Error listing columns for ${table}:`, err.message);
        }
    }
}

listColumns();
