import { executeQuery } from './src/config/db';

async function test() { 
    try {
        const row = await executeQuery('SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as c FROM [SmartBoxData].[LASIMRA_Request_SMO] r INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID GROUP BY YEAR(r.ApplicationDate) ORDER BY yr DESC');
        console.table(row);
    } catch (e) {
        console.error('Test failed:', e);
    }
}
test();
