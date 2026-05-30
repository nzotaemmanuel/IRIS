import { executeQuery } from './src/config/db';

async function run() {
    try {
        const params = { limit: 50 };
        const structures = await executeQuery(`
            SELECT TOP (@limit)
                r.RequestID as ID,
                r.RequestTitle as SiteID,
                r.ApplicationDate as Date,
                lg.LGAName as LGA,
                COALESCE(ts.StructureTypeName, 'Tower/Mast') as Category,
                'Infrastructure' as Type
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Request_SMO] tm2 ON r.RequestID = tm2.RequestID
            LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON tm2.LocalGovernmentArea_ = lg.ID
            LEFT JOIN [SmartBoxData].[LASIMRA_StructureType_SMO] ts ON tm.TypeOfStructure = ts.StructureTypeID
            WHERE 1=1 
            ORDER BY r.ApplicationDate DESC
        `, params);
        console.log('Structures API equivalent:', structures.length);
        process.exit(0);
    } catch(e: any) {
        console.error(e.message);
        process.exit(1);
    }
}
run();
