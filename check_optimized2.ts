import { executeQuery } from './src/config/db';

async function test() {
  try {
    const total = await executeQuery(`
      SELECT COUNT(r.RequestID) as c 
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r
      INNER JOIN (
        SELECT RequestID FROM [SmartBoxData].[LASIMRA_RowRequest_SMO]
        UNION ALL
        SELECT RequestID FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]
      ) as combined ON r.RequestID = combined.RequestID
    `);
    console.log('Total Query Count:', total[0].c);
  } catch(e:any) {
    console.error('Error:', e.message);
  }
}
test();
