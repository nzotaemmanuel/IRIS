import { executeQuery } from './src/config/db';

async function simulateApi() {
    try {
        const type = 'row'; 
        const params: any = { limit: 50 };
        let dateFilter = '';
        const lgaId = '';

        const structures = await executeQuery(`
            SELECT TOP (@limit)
                r.RequestID as ID,
                r.RequestTitle as SiteID,
                r.ApplicationDate as Date,
                lg.LGAName as LGA,
                COALESCE(pc.ProjectCategoryName, 'RoW Generic') as Category,
                'Right of Way' as Type
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
            LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON rr.LocalGovernmentArea = lg.ID
            LEFT JOIN [SmartBoxData].[LASIMRA_ROWProcjectCategory_SMO] pc ON rr.ProjectCategory = pc.ID
            WHERE 1=1 ${dateFilter} ${lgaId ? ' AND rr.LocalGovernmentArea = @lgaId' : ''}
            ORDER BY r.ApplicationDate DESC
        `, params);

        console.log('RoW Data Length:', structures.length);

    } catch (err) {
        console.error(err);
    }
}

simulateApi();
