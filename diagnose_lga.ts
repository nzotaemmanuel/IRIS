
import { executeQuery } from './src/config/db';

async function diagnose() {
    console.log('--- Diagnostic: Checking LGA Columns ---');
    try {
        const topRow = await executeQuery("SELECT TOP 1 RequestID, LocalGovernmentArea_ FROM [SmartBoxData].[LASIMRA_Request_SMO] WHERE RequestID IN (SELECT RequestID FROM [SmartBoxData].[LASIMRA_RowRequest_SMO])");
        console.log('LASIMRA_Request_SMO (LGA_):', topRow[0]);

        const topRowDetail = await executeQuery("SELECT TOP 1 RequestID, LocalGovernmentArea FROM [SmartBoxData].[LASIMRA_RowRequest_SMO]");
        console.log('LASIMRA_RowRequest_SMO (LGA):', topRowDetail[0]);

        const topMastDetail = await executeQuery("SELECT TOP 1 RequestID, LocalGovernmentArea FROM [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]");
        console.log('LASIMRA_TowerMast_Reqeust_SMO (LGA):', topMastDetail[0]);
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

diagnose();
