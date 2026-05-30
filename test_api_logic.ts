
import { executeQuery } from './src/config/db';

async function testApiLogic() {
    console.log('--- Testing API Logic (Internal) ---');
    try {
        // Simulating the 'all' logic I just implemented
        let lgaId = 'all'; 
        if (lgaId === 'all' || lgaId === 'null' || lgaId === 'undefined' || !lgaId) {
            lgaId = '';
        }
        
        console.log(`Resolved LGA ID: "${lgaId}" (Should be empty string)`);

        const limit = 50;
        const params: any = { limit };
        if (lgaId) { params.lgaId = lgaId; }

        const type = 'mast';
        console.log(`\nTesting Mast Query with resolved LGA...`);
        const mastSql = `
            SELECT TOP (@limit)
                r.RequestID as ID,
                r.RequestTitle as SiteID,
                r.ApplicationDate as Date,
                lg.LGAName as LGA,
                COALESCE(ts.StructureTypeName, 'Tower/Mast') as Category,
                'Infrastructure' as Type
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON tm.LocalGovernmentArea = lg.ID
            LEFT JOIN [SmartBoxData].[LASIMRA_StructureType_SMO] ts ON tm.TypeOfStructure = ts.StructureTypeID
            WHERE 1=1 ${lgaId ? ' AND tm.LocalGovernmentArea = @lgaId' : ''}
            ORDER BY r.ApplicationDate DESC
        `;
        
        const results = await executeQuery(mastSql, params);
        console.log(`Success! Found ${results.length} structures.`);
        if (results.length > 0) {
            console.log('Sample Data Row:', results[0]);
        } else {
            console.log('No data found. This is the problem.');
            
            // Debug: Check if joins are the issue
            const countRequest = await executeQuery("SELECT COUNT(*) as count FROM [SmartBoxData].[LASIMRA_Request_SMO]");
            const countMast = await executeQuery("SELECT COUNT(*) as count FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]");
            console.log(`Debug Counts: Requests=${countRequest[0].count}, Masts=${countMast[0].count}`);
        }

    } catch (err: any) {
        console.error('TEST ERROR:', err.message);
    }
}

testApiLogic();
