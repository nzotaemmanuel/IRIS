import { executeQuery } from './src/config/db';

async function checkData() {
  try {
    const q1 = await executeQuery(`
      SELECT TOP 5 r.RequestID, r.ProcessType, tmr.LocalGovernmentArea_
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r
      JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tmr ON r.RequestID = tmr.RequestID
      WHERE r.ProcessType = 2
    `);
    
    console.log('ROW requests with LGA in TowerMast_Request_SMO:', q1);
  } catch(e: any) {
    console.error(e.message);
  }
}

checkData();
