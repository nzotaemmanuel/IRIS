
import { executeQuery } from './src/config/db';

async function check() {
    try {
        const r = await executeQuery("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LASIMRA_Request_SMO' AND TABLE_SCHEMA = 'SmartBoxData'");
        console.log('ACTUAL COLUMNS in LASIMRA_Request_SMO:');
        console.log(r.map((c: any) => c.COLUMN_NAME).join(', '));
        
        const r2 = await executeQuery("SELECT TOP 1 * FROM [SmartBoxData].[LASIMRA_Request_SMO]");
        console.log('\nSample Row Keys:', Object.keys(r2[0]).join(', '));
    } catch (e: any) {
        console.error('ERROR:', e.message);
    }
}
check();
