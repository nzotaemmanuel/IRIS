
import { executeQuery } from './src/config/db';

async function check() {
    try {
        const r = await executeQuery('SELECT TOP 1 * FROM [SmartBoxData].[LASIMRA_Request_SMO]');
        console.log('COLUMNS:', Object.keys(r[0]).join(', '));
    } catch (e: any) {
        console.error('ERROR:', e.message);
    }
}
check();
