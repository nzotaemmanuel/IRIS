
import { executeQuery } from './src/config/db';

async function checkLgaColumns() {
    const tables = ['LASIMRA_Request_SMO', 'LASIMRA_RowRequest_SMO', 'LASIMRA_TowerMast_Reqeust_SMO'];
    console.log('--- Checking LGA Columns ---');
    for (const table of tables) {
        try {
            const columns = await executeQuery(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = @table
            `, { table });
            
            const lgaCols = columns
                .map((c: any) => c.COLUMN_NAME)
                .filter((c: string) => 
                    c.toLowerCase().includes('lga') || 
                    c.toLowerCase().includes('local') || 
                    c.toLowerCase().includes('government') ||
                    c.toLowerCase().includes('area')
                );
            
            console.log(`Table: ${table}`);
            console.log(`LGA-related columns: ${lgaCols.join(', ') || 'NONE'}`);
            
            if (lgaCols.length > 0) {
                // Check if any has data
                const sample = await executeQuery(`SELECT TOP 1 ${lgaCols[0]} as val FROM [SmartBoxData].[${table}] WHERE ${lgaCols[0]} IS NOT NULL`);
                console.log(`Sample value from ${lgaCols[0]}: ${sample[0]?.val ?? 'NULL'}`);
            }
        } catch (err: any) {
            console.error(`Error checking ${table}:`, err.message);
        }
    }
}

checkLgaColumns();
