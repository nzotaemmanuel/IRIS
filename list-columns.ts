import { executeQuery } from './src/config/db';

async function listColumns() {
  try {
    const requestCols = await executeQuery(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'LASIMRA_Request_SMO'
    `);
    console.log('Columns in LASIMRA_Request_SMO:', requestCols.map((c: any) => c.COLUMN_NAME));

    const paymentCols = await executeQuery(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'LASIMRA_Payment_SMO'
    `);
    console.log('Columns in LASIMRA_Payment_SMO:', paymentCols.map((c: any) => c.COLUMN_NAME));
    
    const towerCols = await executeQuery(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'LASIMRA_TowerMastDetails_SMO'
    `);
    console.log('Columns in LASIMRA_TowerMastDetails_SMO:', towerCols.map((c: any) => c.COLUMN_NAME));
  } catch (error) {
    console.error('Error listing columns:', error);
  }
}

listColumns();
