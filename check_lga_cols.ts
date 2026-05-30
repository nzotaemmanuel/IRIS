
import { executeQuery } from './src/config/db';
async function f() {
  try {
    const r1 = await executeQuery("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LASIMRA_RowRequest_SMO'");
    console.log('Row Columns:', r1.map((c: any) => c.COLUMN_NAME).join(', '));
    const r2 = await executeQuery("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LASIMRA_TowerMast_Reqeust_SMO'");
    console.log('Mast Columns:', r2.map((c: any) => c.COLUMN_NAME).join(', '));
  } catch(e: any) {
    console.error(e.message);
  }
}
f();
