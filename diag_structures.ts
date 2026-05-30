import { executeQuery } from './src/config/db';

async function simulateApi() {
    try {
        const limit = 50;
        const type = 'mast'; // Default tab
        const lgaId = ''; 
        const period = 'all';

        const params: any = { limit };
        let dateFilter = '';

        // Repeat logic from structures.ts
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
            WHERE 1=1 ${dateFilter} ${lgaId ? ' AND tm2.LocalGovernmentArea_ = @lgaId' : ''}
            ORDER BY r.ApplicationDate DESC
        `, params);

        console.log(JSON.stringify({ data: structures }));

    } catch (err) {
        console.error(err);
    }
}

simulateApi();
