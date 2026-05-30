
import { executeQuery } from './src/config/db';
async function f() {
  try {
    const r = await executeQuery(`
      SELECT TOP 5 tm.RequestID, tmd.Local_Government_Area, tmd.Site_Name__SiteID__Code_
      FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm
      LEFT JOIN [SmartBoxData].[LASIMRA_TowerMastDetails_SMO] tmd ON tm.MastID = tmd.MastID
    `);
    console.log('Mast Join Data:', JSON.stringify(r, null, 2));
  } catch(e: any) {
    console.error(e.message);
  }
}
f();
