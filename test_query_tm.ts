import { executeQuery } from './src/config/db';

async function run() {
    try {
        const statsStr = await executeQuery(`
            SELECT COUNT(r.RequestID) as count 
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
        `);
        console.log('Stats INNER JOIN count:', statsStr[0]);

        const structures = await executeQuery(`
            SELECT TOP 5
                r.RequestID as ID,
                r.ApplicationDate as Date,
                lg.LGAName as LGA,
                COALESCE(ts.StructureTypeName, 'Tower/Mast') as Category,
                'Infrastructure' as Type
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
            LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON tm2.LocalGovernmentArea_ = lg.ID
            LEFT JOIN [SmartBoxData].[LASIMRA_StructureType_SMO] ts ON tm.TypeOfStructure = ts.StructureTypeID
            ORDER BY r.ApplicationDate DESC
        `);
        console.log('Structures TOP 5:', structures);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
