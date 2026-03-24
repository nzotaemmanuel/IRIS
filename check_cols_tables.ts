import { executeQuery } from './src/config/db';
import fs from 'fs';

async function checkCols() {
  try {
    const q1 = await executeQuery("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Row%' OR TABLE_NAME LIKE '%Mast%' OR TABLE_NAME LIKE '%Tower%'");
    
    fs.writeFileSync('all_tables_search.json', JSON.stringify({
      tables: q1.map((r: any) => r.TABLE_NAME)
    }, null, 2));
    console.log('Done writing all_tables_search.json');
  } catch(e: any) {
    console.error(e.message);
  }
}

checkCols();
