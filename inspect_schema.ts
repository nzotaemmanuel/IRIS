import { executeQuery } from './src/config/db';
import fs from 'fs';

async function listColumns() {
    const tables = [
        'LASIMRA_Payment_SMO',
        'LASIMRA_Request_SMO',
        'LASIMRA_TowerMastDetails_SMO',
        'LASIMRA_CustomerDetails_SMO'
    ];

    let output = '';

    for (const table of tables) {
        output += `--- Columns for ${table} ---\n`;
        try {
            const result = await executeQuery(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table}'
            `) as any[];
            output += result.map(r => r.COLUMN_NAME).join(', ') + '\n\n';
        } catch (err: any) {
            output += `Error listing columns for ${table}: ${err.message}\n\n`;
        }
    }

    fs.writeFileSync('schema_results.txt', output);
    console.log('Results written to schema_results.txt');
}

listColumns();
