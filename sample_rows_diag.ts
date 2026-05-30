
import { executeQuery } from './src/config/db';
async function f() {
  try {
    const r = await executeQuery(`
      SELECT TOP 1 *
      FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]
    `);
    console.log('Sample Mast Row:', JSON.stringify(r[0], null, 2));
    
    const r2 = await executeQuery(`
      SELECT TOP 1 *
      FROM [SmartBoxData].[LASIMRA_Request_SMO]
    `);
    console.log('Sample Request_SMO Row:', JSON.stringify(r2[0], null, 2));
  } catch(e: any) {
    console.error(e.message);
  }
}
f();
