
import { executeQuery } from './src/config/db';

async function findLga() {
    try {
        const query = `
            SELECT TABLE_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE COLUMN_NAME LIKE '%Government%' 
               OR COLUMN_NAME LIKE 'LGA%'
               OR COLUMN_NAME LIKE '%Local%Area%'
        `;
        const results = await executeQuery(query);
        console.log('LGA-related columns results:', JSON.stringify(results, null, 2));
        
        // Also check if Request_SMO has ANY column that looks like an ID
        const reqCols = await executeQuery("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LASIMRA_Request_SMO'");
        console.log('Request_SMO Columns:', reqCols.map((c: any) => c.COLUMN_NAME).join(', '));
        
    } catch (err: any) {
        console.error('Error finding LGA columns:', err.message);
    }
}

findLga();
