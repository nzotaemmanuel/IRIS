import { executeQuery } from './src/config/db';

async function checkCols() {
  try {
    const t1 = await executeQuery("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LASIMRA_RowRequest_SMO'");
    console.log('LASIMRA_RowRequest_SMO cols:', t1.map((c: any) => c.COLUMN_NAME));
    
    const t2 = await executeQuery("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LASIMRA_TowerMastReqeust_SMO'");
    console.log('LASIMRA_TowerMastReqeust_SMO cols:', t2.map((c: any) => c.COLUMN_NAME));
  } catch(e: any) {
    console.error(e.message);
  }
}

checkCols();
