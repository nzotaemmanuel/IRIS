import { executeQuery } from './src/config/db';

async function test() {
  try {
    const total = await executeQuery(`
      SELECT COUNT(*) as c
      FROM (
        SELECT RequestID FROM [SmartBoxData].[LASIMRA_RowRequest_SMO] WHERE RequestID IS NOT NULL
        UNION
        SELECT RequestID FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] WHERE RequestID IS NOT NULL
      ) as combined
      INNER JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON r.RequestID = combined.RequestID
    `);
    console.log('Optimized Query Count:', total[0].c);
  } catch(e:any) {
    console.error('Error:', e.message);
  }
}
test();
