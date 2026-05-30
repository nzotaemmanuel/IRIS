import { executeQuery } from './src/config/db';

async function debug() {
    try {
        const typo2026 = await executeQuery('SELECT COUNT(*) as count FROM [SmartBoxData].[LASIMRA_Request_SMO] r INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID WHERE YEAR(r.ApplicationDate) = 2024 OR YEAR(r.ApplicationDate) = 2025 OR YEAR(r.ApplicationDate) = 2026');
        const correct2026 = await executeQuery('SELECT COUNT(*) as count FROM [SmartBoxData].[LASIMRA_Request_SMO] r INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID WHERE YEAR(r.ApplicationDate) = 2024 OR YEAR(r.ApplicationDate) = 2025 OR YEAR(r.ApplicationDate) = 2026');

        console.log('--- 2024/2025/2026 Breakdown ---');
        const typoByYear = await executeQuery('SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as count FROM [SmartBoxData].[LASIMRA_Request_SMO] r INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID GROUP BY YEAR(r.ApplicationDate) ORDER BY yr DESC');
        const correctByYear = await executeQuery('SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as count FROM [SmartBoxData].[LASIMRA_Request_SMO] r INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID GROUP BY YEAR(r.ApplicationDate) ORDER BY yr DESC');
        const rowByYear = await executeQuery('SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as count FROM [SmartBoxData].[LASIMRA_Request_SMO] r INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID GROUP BY YEAR(r.ApplicationDate) ORDER BY yr DESC');

        console.log('Typo table by year:');
        console.table(typoByYear);
        console.log('Correct table by year:');
        console.table(correctByYear);
        console.log('RoW table by year:');
        console.table(rowByYear);

        const intersectionCount = await executeQuery(`
            SELECT YEAR(r.ApplicationDate) as yr, COUNT(*) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
            GROUP BY YEAR(r.ApplicationDate)
        `);
        console.log('Intersection by year:');
        console.table(intersectionCount);

    } catch (err) {
        console.error('Debug failed:', err);
    }
}

debug();
