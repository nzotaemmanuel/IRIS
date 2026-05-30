
import { executeQuery } from './src/config/db';

async function finalCheck() {
    const tables = ['LASIMRA_Request_SMO', 'LASIMRA_TowerMast_Reqeust_SMO', 'LASIMRA_RowRequest_SMO'];
    for (const table of tables) {
        try {
            console.log(`--- Columns for ${table} ---`);
            const cols = await executeQuery(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = @table
            `, { table });
            console.log(cols.map((c: any) => c.COLUMN_NAME).join(', '));
            
            // Specifically look for anything that might be LGA
            const matches = cols
                .map((c: any) => c.COLUMN_NAME)
                .filter((c: string) => 
                    c.toLowerCase().includes('lga') || 
                    c.toLowerCase().includes('local') || 
                    c.toLowerCase().includes('govt') ||
                    c.toLowerCase().includes('area')
                );
            console.log(`Potential LGA columns in ${table}:`, matches);
            
        } catch (err: any) {
            console.error(`Error checking ${table}:`, err.message);
        }
    }
}

finalCheck();
