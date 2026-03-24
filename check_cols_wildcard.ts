import { executeQuery } from './src/config/db';
import fs from 'fs';

async function checkCols() {
  try {
    const q1 = await executeQuery("SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE '%LocalGovernment%' OR COLUMN_NAME LIKE '%LGA%'");
    const q2 = await executeQuery("SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE '%ProjectCategory%'");
    
    fs.writeFileSync('cols_wildcard.json', JSON.stringify({
      lga_cols: q1.map((r: any) => `${r.TABLE_NAME}.${r.COLUMN_NAME}`),
      pc_cols: q2.map((r: any) => `${r.TABLE_NAME}.${r.COLUMN_NAME}`)
    }, null, 2));
    console.log('Done writing cols_wildcard.json');
  } catch(e: any) {
    console.error(e.message);
  }
}

checkCols();
