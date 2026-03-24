import { executeQuery } from './src/config/db';

async function test() {
  try {
    const r1 = await executeQuery('SELECT COUNT(*) as c FROM [SmartBoxData].[LASIMRA_RowRequest_SMO]');
    console.log('ROW Table Count:', r1[0].c);
    
    const r2 = await executeQuery('SELECT COUNT(*) as c FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]');
    console.log('Tower Table Count:', r2[0].c);
    
    const total = await executeQuery(`
      SELECT COUNT(r.RequestID) as c 
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r 
      LEFT JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID 
      LEFT JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID 
      WHERE (rr.RequestID IS NOT NULL OR tm.RequestID IS NOT NULL)
    `);
    console.log('Total Query Count:', total[0].c);
  } catch(e:any) {
    console.error('Error:', e.message);
  }
}
test();
