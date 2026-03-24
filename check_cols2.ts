import { executeQuery } from './src/config/db';
import fs from 'fs';

async function checkCols() {
  try {
    const t3 = await executeQuery("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE (TABLE_NAME LIKE '%ROW%' OR TABLE_NAME LIKE '%Tower%') AND TABLE_NAME LIKE '%SMO%'");

    fs.writeFileSync('cols.json', JSON.stringify({
      tables: t3.map((c: any) => c.TABLE_NAME)
    }, null, 2));
    console.log('Done writing cols.json');
  } catch(e: any) {
    console.error(e.message);
  }
}

checkCols();
