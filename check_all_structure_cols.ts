
import { executeQuery } from './src/config/db';
async function f() {
  try {
    const tables = [
      'LASIMRA_Request_SMO',
      'LASIMRA_RowRequest_SMO',
      'LASIMRA_TowerMast_Reqeust_SMO',
      'LASIMRA_TowerMastDetails_SMO'
    ];
    for (const table of tables) {
      const r = await executeQuery(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
      console.log(`${table}:`, r.map((c: any) => c.COLUMN_NAME).join(', '));
    }
  } catch(e: any) {
    console.error(e.message);
  }
}
f();
