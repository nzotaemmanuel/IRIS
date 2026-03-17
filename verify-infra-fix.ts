import { executeQuery } from './src/config/db';

async function verifyInfrastructureFix() {
  console.log('--- Verifying Infrastructure Fix (1=MAST/28, 2=RoW/13) ---');
  
  try {
    const totalQuery = `
      SELECT COUNT(t.ID) as value 
      FROM [SmartBoxData].[LASIMRA_TowerMastDetails_SMO] t
      JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON t.RequestID = r.RequestID
      WHERE (r.ProcessType = 1 AND r.StatusID = 28) 
         OR (r.ProcessType = 2 AND r.StatusID = 13)
    `;
    const total = await executeQuery(totalQuery);
    console.log('Total Approved Structures:', total);

    const distributionQuery = `
      SELECT 
        CASE WHEN r.ProcessType = 1 THEN 'MAST'
             WHEN r.ProcessType = 2 THEN 'RoW'
             ELSE 'Other' END as label,
        COUNT(t.ID) as value
      FROM [SmartBoxData].[LASIMRA_TowerMastDetails_SMO] t
      JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON t.RequestID = r.RequestID
      WHERE (r.ProcessType = 1 AND r.StatusID = 28) 
         OR (r.ProcessType = 2 AND r.StatusID = 13)
      GROUP BY r.ProcessType
    `;
    const distribution = await executeQuery(distributionQuery);
    console.log('Distribution Data:', distribution);

  } catch (error) {
    console.error('Error verifying fix:', error);
  }
}

verifyInfrastructureFix();
