import { executeQuery } from './src/config/db';

async function diagnose() {
  try {
    const query = `
      SELECT COUNT(*) as c
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r
      INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
      INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
    `;
    const res = await executeQuery(query);
    console.log('Total Mast with Request Join:', res[0].c);

    const rCount = await executeQuery("SELECT COUNT(*) as c FROM [SmartBoxData].[LASIMRA_Request_SMO]");
    console.log('LASIMRA_Request_SMO Count:', rCount[0].c);

    const first5 = await executeQuery("SELECT TOP 5 RequestID FROM [SmartBoxData].[LASIMRA_Request_SMO]");
    console.log('Sample IDs from Request:', first5.map((s:any) => s.RequestID));

  } catch (err) {
    console.error(err);
  }
}

diagnose();
