import { executeQuery } from './src/config/db';

async function listColumns() {
  try {
    const columns = await executeQuery(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'LASIMRA_Request_SMO'
    `);
    console.log('Columns in LASIMRA_Request_SMO:', columns.map((c: any) => c.COLUMN_NAME));
  } catch (error) {
    console.error('Error listing columns:', error);
  }
}

listColumns();
