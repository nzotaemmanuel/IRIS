import { executeQuery } from './src/config/db';

async function test() { 
    try {
        console.log('--- REFINING DATA INVESTIGATION ---');
        
        const masts = await executeQuery(`
            SELECT TOP 10 
                r.RequestID, 
                tm.TypeOfStructure, 
                tm2.LocalGovernmentArea_ as lga_id
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
            ORDER BY r.ApplicationDate DESC
        `);
        console.log('Mast Sample (Joined):');
        console.table(masts);

        const lgas = await executeQuery('SELECT TOP 5 ID, LGAName FROM [SmartBoxData].[LASIMRA_LocalGovernment_SMO]');
        console.log('LGA Master Table Sample:');
        console.table(lgas);

        const counts = await executeQuery(`
            SELECT 
                (SELECT COUNT(*) FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm INNER JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON tm.RequestID = r.RequestID) as typo_with_req,
                (SELECT COUNT(*) FROM [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 INNER JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON tm2.RequestID = r.RequestID) as correct_with_req,
                (SELECT COUNT(*) 
                 FROM [SmartBoxData].[LASIMRA_Request_SMO] r 
                 INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID 
                 INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID) as triple_join
        `);
        console.log('Counts summary:');
        console.table(counts);

    } catch (e) {
        console.error('Test failed:', e);
    }
}
test();
