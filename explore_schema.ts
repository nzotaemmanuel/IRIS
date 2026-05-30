import { executeQuery } from './src/config/db';

async function explore() {
    try {
        const table1 = 'LASIMRA_TowerMast_Reqeust_SMO';
        const table2 = 'LASIMRA_TowerMast_Request_SMO';
        
        console.log(`--- Columns for ${table1} ---`);
        const cols1 = await executeQuery(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table1}'`);
        console.log(cols1.map((c: any) => c.COLUMN_NAME).join(', '));
        
        console.log(`\n--- Columns for ${table2} ---`);
        const cols2 = await executeQuery(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table2}'`);
        console.log(cols2.map((c: any) => c.COLUMN_NAME).join(', '));

        console.log('\n--- Data Check ---');
        const sample = await executeQuery(`
            SELECT TOP 5 r.RequestID, r.ApplicationDate, tm.LocalGovernmentArea as LGA_Typo, tm2.LocalGovernmentArea_ as LGA_Correct
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
        `);
        console.table(sample);

    } catch (err) {
        console.error('Exploration failed:', err);
    }
}
explore();
