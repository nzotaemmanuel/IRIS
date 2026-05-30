
import { executeQuery } from './src/config/db';

async function verify() {
    try {
        console.log('--- VERIFYING TOWER JOINS WITH RequestID ---');
        const q1 = `
            SELECT TOP 5 r.RequestID, r.RequestTitle, tm.MastID
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
        `;
        const res1 = await executeQuery(q1);
        console.log('Tower Join Results:', JSON.stringify(res1, null, 2));

        console.log('\n--- VERIFYING ROW JOINS WITH RequestID ---');
        const q2 = `
            SELECT TOP 5 r.RequestID, r.RequestTitle, rr.RowID
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
        `;
        const res2 = await executeQuery(q2);
        console.log('RoW Join Results:', JSON.stringify(res2, null, 2));
    } catch (e: any) {
        console.error('VERIFICATION ERROR:', e.message);
    }
}
verify();
