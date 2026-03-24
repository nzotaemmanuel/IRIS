import { executeQuery } from './src/config/db';
import fs from 'fs';

async function checkCols() {
  try {
    const q1 = await executeQuery("SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME LIKE '%ROW%'");
    
    fs.writeFileSync('row_cols.json', JSON.stringify({
      cols: q1.map((r: any) => `${r.TABLE_NAME}.${r.COLUMN_NAME}`)
    }, null, 2));
    console.log('Done writing row_cols.json');
  } catch(e: any) {
    console.error(e.message);
  }
}

checkCols();
