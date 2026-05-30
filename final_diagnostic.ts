import { executeQuery } from './src/config/db';

async function test() { 
    try {
        const row = await executeQuery('SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as c FROM [SmartBoxData].[LASIMRA_Request_SMO] r INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID GROUP BY YEAR(r.ApplicationDate) ORDER BY yr DESC');
        console.log('RoW by Year:');
        console.table(row);

        const mast = await executeQuery(`
            SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as c 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r 
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID 
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID 
            GROUP BY YEAR(r.ApplicationDate) 
            ORDER BY yr DESC
        `);
        console.log('Mast (Joined) by Year:');
        console.table(mast);

        const mastCorrectOnly = await executeQuery(`
            SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as c 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r 
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID 
            GROUP BY YEAR(r.ApplicationDate) 
            ORDER BY yr DESC
        `);
        console.log('Mast (Correct Table Only) by Year:');
        console.table(mastCorrectOnly);

        const lgaCheck = await executeQuery(`
            SELECT TOP 5 r.RequestID, tm2.LocalGovernmentArea_ 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r 
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
        `);
        console.log('Sample LGA IDs from tm2:');
        console.table(lgaCheck);

    } catch (e) { console.error(e); }
}
test();
