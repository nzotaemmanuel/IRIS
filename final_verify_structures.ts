
import { executeQuery } from './src/config/db';

async function verify() {
    console.log('--- FINAL STRUCTURES VERIFICATION ---');
    const testLgaId = '8';
    const params = { lgaId: testLgaId, limit: 5 };

    try {
        // 1. Stats
        console.log('\n[1] Testing Stats...');
        const rowStats = await executeQuery(`
            SELECT COUNT(r.RequestID) as count FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
        `, {});
        const tmStats = await executeQuery(`
            SELECT COUNT(r.RequestID) as count FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
        `, {});
        console.log(`Total RoW: ${rowStats[0].count}, Total Mast: ${tmStats[0].count}`);

        const filteredRowStats = await executeQuery(`
            SELECT COUNT(r.RequestID) as count FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
            WHERE rr.LocalGovernmentArea = @lgaId
        `, { lgaId: testLgaId });
        console.log(`LGA ${testLgaId} RoW: ${filteredRowStats[0].count}`);

        // 2. Trend
        console.log('\n[2] Testing Trend...');
        const trend = await executeQuery(`
            SELECT TOP 3 FORMAT(r.ApplicationDate, 'yyyy-MM') as label, COUNT(r.RequestID) as value
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN (
                SELECT RequestID, LocalGovernmentArea FROM [SmartBoxData].[LASIMRA_RowRequest_SMO]
                UNION ALL
                SELECT RequestID, LocalGovernmentArea FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]
            ) as combined ON r.RequestID = combined.RequestID
            WHERE combined.LocalGovernmentArea = @lgaId
            GROUP BY FORMAT(r.ApplicationDate, 'yyyy-MM')
            ORDER BY label ASC
        `, { lgaId: testLgaId });
        console.log(`LGA ${testLgaId} Trend Sample:`, JSON.stringify(trend, null, 2));

        // 3. List RoW
        console.log('\n[3] Testing RoW List...');
        const rowList = await executeQuery(`
            SELECT TOP 3 r.RequestID as ID, r.RequestTitle as SiteID, lg.LGAName as LGA
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
            LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON rr.LocalGovernmentArea = lg.ID
            WHERE rr.LocalGovernmentArea = @lgaId
        `, { lgaId: testLgaId });
        console.log(`LGA ${testLgaId} RoW List Sample:`, JSON.stringify(rowList, null, 2));

        // 4. List Mast
        console.log('\n[4] Testing Mast List...');
        const mastList = await executeQuery(`
            SELECT TOP 3 r.RequestID as ID, r.RequestTitle as SiteID, lg.LGAName as LGA
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            LEFT JOIN [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg ON tm.LocalGovernmentArea = lg.ID
            WHERE tm.LocalGovernmentArea = @lgaId
        `, { lgaId: testLgaId });
        console.log(`LGA ${testLgaId} Mast List Sample:`, JSON.stringify(mastList, null, 2));

    } catch (err: any) {
        console.error('VERIFICATION ERROR:', err.message);
    }
}

verify();
