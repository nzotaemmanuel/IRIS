
import { executeQuery } from './src/config/db';
async function f() {
  try {
    const r = await executeQuery(`
      SELECT TABLE_NAME, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE COLUMN_NAME IN ('Local_Government_Area', 'Area', 'LocalGovArea', 'LocalGovernmentArea_')
    `);
    console.log('LGA Field Discovery:', JSON.stringify(r, null, 2));
    
    // Also check for something that looks like SiteID
    const r2 = await executeQuery(`
      SELECT TABLE_NAME, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE COLUMN_NAME LIKE '%SiteID%' OR COLUMN_NAME LIKE '%Site_Name%'
    `);
    console.log('SiteID Field Discovery:', JSON.stringify(r2, null, 2));
  } catch(e: any) {
    console.error(e.message);
  }
}
f();
