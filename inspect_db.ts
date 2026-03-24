import { executeQuery } from './src/config/db';
import fs from 'fs';

async function inspect() {
  try {
    const tables = await executeQuery("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'SmartBoxData'");
    const details: any = {};
    
    for (const table of tables) {
      const name = table.TABLE_NAME;
      const columns = await executeQuery(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${name}'`);
      details[name] = columns.map((c: any) => c.COLUMN_NAME);
    }
    
    fs.writeFileSync('db_inspection.json', JSON.stringify(details, null, 2));
    console.log('Inspection complete. Check db_inspection.json');
  } catch (err: any) {
    console.error('Inspection failed:', err.message);
  }
}

inspect();
