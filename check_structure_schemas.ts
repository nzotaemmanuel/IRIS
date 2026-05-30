import { executeQuery } from './src/config/db';

async function inspectTables() {
    try {
        console.log('--- Columns in LASIMRA_RowRequest_SMO ---');
        const rowsCols = await executeQuery(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'LASIMRA_RowRequest_SMO'
        `);
        console.table(rowsCols);

        console.log('\n--- Columns in LASIMRA_TowerMast_Reqeust_SMO ---');
        const mastCols = await executeQuery(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'LASIMRA_TowerMast_Reqeust_SMO'
        `);
        console.table(mastCols);
    } catch (err) {
        console.error('Inspection failed:', err);
    }
}

inspectTables();
