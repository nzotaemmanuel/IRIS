
import { executeQuery } from './src/config/db';

async function finalSchemaCheck() {
    try {
        console.log('--- LASIMRA_TowerMast_Reqeust_SMO Sample Record ---');
        const mast = await executeQuery("SELECT TOP 1 * FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]");
        console.log(JSON.stringify(mast[0], null, 2));

        console.log('\n--- LASIMRA_Request_SMO Sample Record ---');
        const req = await executeQuery("SELECT TOP 1 * FROM [SmartBoxData].[LASIMRA_Request_SMO]");
        console.log(JSON.stringify(req[0], null, 2));

        console.log('\n--- LASIMRA_RowRequest_SMO Sample Record ---');
        const row = await executeQuery("SELECT TOP 1 * FROM [SmartBoxData].[LASIMRA_RowRequest_SMO]");
        console.log(JSON.stringify(row[0], null, 2));

    } catch (err: any) {
        console.error('Schema check error:', err.message);
    }
}

finalSchemaCheck();
