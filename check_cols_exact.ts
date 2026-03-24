import { executeQuery } from './src/config/db';
import fs from 'fs';

async function checkCols() {
  try {
    const cols = ['LocalGovernmentArea', 'TypeOfStructure', 'ProjectCategory'];
    const results: any = {};
    
    for (const col of cols) {
      const q = await executeQuery(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = '${col}'`);
      results[col] = q.map((r: any) => r.TABLE_NAME);
    }

    fs.writeFileSync('cols_search.json', JSON.stringify(results, null, 2));
    console.log('Done writing cols_search.json');
  } catch(e: any) {
    console.error(e.message);
  }
}

checkCols();
