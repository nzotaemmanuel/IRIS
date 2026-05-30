
import { executeQuery } from './src/config/db';

async function finalAudit() {
    console.log('--- Structures API Logic Audit ---');
    try {
        // Test MAST query (Infrastructure)
        console.log('\nTesting Infrastructure (Mast)...');
        const mastSql = `
            SELECT TOP (5)
                r.RequestID as ID,
                r.RequestTitle as SiteID,
                r.ApplicationDate as Date,
                tm.LocalGovernmentArea as LGA_ID
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO] tm ON r.RequestID = tm.RequestID
            ORDER BY r.ApplicationDate DESC
        `;
        const mastResults = await executeQuery(mastSql);
        console.log(`Found ${mastResults.length} Mast records.`);
        if (mastResults.length > 0) {
            console.log('Sample Mast:', mastResults[0]);
        }

        // Test RoW query
        console.log('\nTesting Right of Way (RoW)...');
        const rowSql = `
            SELECT TOP (5)
                r.RequestID as ID,
                r.RequestTitle as SiteID,
                r.ApplicationDate as Date,
                rr.LocalGovernmentArea as LGA_ID
            FROM [SmartBoxData].[LASIMRA_Request_SMO] r
            INNER JOIN [SmartBoxData].[LASIMRA_RowRequest_SMO] rr ON r.RequestID = rr.RequestID
            ORDER BY r.ApplicationDate DESC
        `;
        const rowResults = await executeQuery(rowSql);
        console.log(`Found ${rowResults.length} RoW records.`);
        if (rowResults.length > 0) {
            console.log('Sample RoW:', rowResults[0]);
        }

        // Test with LGA Join
        console.log('\nTesting Join with LGA Table...');
        const joinSql = `
            SELECT TOP 1 lg.LGAName
            FROM [SmartBoxData].[LASIMRA_LocalGovernment_SMO] lg
            WHERE lg.ID IS NOT NULL
        `;
        const joinResults = await executeQuery(joinSql);
        console.log('LGA Table Test Result:', joinResults);

    } catch (err: any) {
        console.error('AUDIT ERROR:', err.message);
        if (err.stack) console.error(err.stack);
    }
}

finalAudit();
