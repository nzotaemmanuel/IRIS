
import { executeQuery } from './src/config/db';

async function listTables() {
    try {
        console.log('--- TABLES IN SmartBoxData ---');
        const q = `
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'SmartBoxData' 
            AND TABLE_NAME LIKE 'LASIMRA_%'
        `;
        const res = await executeQuery(q);
        console.log('Tables:', res.map((r: any) => r.TABLE_NAME).join(', '));
    } catch (e: any) {
        console.error('ERROR:', e.message);
    }
}
listTables();
