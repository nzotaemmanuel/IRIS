import { executeQuery } from './src/config/db';
import fs from 'fs';

async function find() {
  try {
    const r = await executeQuery("SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE 'LocalGovernmentArea%'");
    const results = r.map((t: any) => `${t.TABLE_SCHEMA}.${t.TABLE_NAME}`);
    fs.writeFileSync('tables_with_lga.json', JSON.stringify(results, null, 2));
    console.log('Tables found:', results);
  } catch (err: any) {
    console.error('Search failed:', err.message);
  }
}

find();
