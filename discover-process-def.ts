import { executeQuery } from './src/config/db';

async function discoverProcessDefinition() {
  try {
    const columns = await executeQuery(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'LASIMRA_ProcessDefinition_SMO'
      ORDER BY COLUMN_NAME
    `);
    
    const sample = await executeQuery(`
      SELECT TOP 10 * FROM [SmartBoxData].[LASIMRA_ProcessDefinition_SMO]
    `);
    
    console.log('SCHEMA_DISCOVERY_START');
    console.log(JSON.stringify({ columns, sample }, null, 2));
    console.log('SCHEMA_DISCOVERY_END');
  } catch (error: any) {
    console.error(error.message);
  }
}

discoverProcessDefinition();
