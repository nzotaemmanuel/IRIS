import { executeQuery } from './src/config/db';

async function test() { 
    try {
        console.log('--- REFRESHING DATA BREKADOWN ---');
        
        const rowByYear = await executeQuery('SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as count FROM [SmartBoxData].[LASIMRA_Request_SMO] r INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID GROUP BY YEAR(r.ApplicationDate) ORDER BY yr DESC');
        console.log('RoW by Year:');
        console.table(rowByYear);

        const mastByYear = await executeQuery(`
            SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r 
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID 
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID 
            GROUP BY YEAR(r.ApplicationDate) 
            ORDER BY yr DESC
        `);
        console.log('Mast (Joined) by Year:');
        console.table(mastByYear);

        const mastCorrectOnly = await executeQuery(`
            SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r 
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID 
            GROUP BY YEAR(r.ApplicationDate) 
            ORDER BY yr DESC
        `);
        console.log('Mast (Correct Table Only) by Year:');
        console.table(mastCorrectOnly);

        const mastTypoOnly = await executeQuery(`
            SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r 
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID 
            GROUP BY YEAR(r.ApplicationDate) 
            ORDER BY yr DESC
        `);
        console.log('Mast (Typo Table Only) by Year:');
        console.table(mastTypoOnly);

    } catch (e) {
        console.error('Test failed:', e);
    }
}
test();
