import { executeQuery } from './src/config/db';

async function verifyInfrastructureData() {
  console.log('--- Verifying Infrastructure Data ---');

  try {
    const totalQuery = `
      SELECT COUNT(t.ID) as value 
      FROM [SmartBoxData].[LASIMRA_TowerMastDetails_SMO] t
      JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON t.RequestID = r.RequestID
      WHERE (r.ProcessType = 1 AND r.StatusID = 13) 
         OR (r.ProcessType = 2 AND r.StatusID = 28)
    `;
    const total = await executeQuery(totalQuery);
    console.log('Total Approved Structures:', total);

    const distributionQuery = `
      SELECT 
        CASE WHEN r.ProcessType = 1 THEN 'RoW'
             WHEN r.ProcessType = 2 THEN 'MAST'
             ELSE 'Other' END as label,
        COUNT(t.ID) as value
      FROM [SmartBoxData].[LASIMRA_TowerMastDetails_SMO] t
      JOIN [SmartBoxData].[LASIMRA_Request_SMO] r ON t.RequestID = r.RequestID
      WHERE (r.ProcessType = 1 AND r.StatusID = 13) 
         OR (r.ProcessType = 2 AND r.StatusID = 28)
      GROUP BY r.ProcessType
    `;
    const distribution = await executeQuery(distributionQuery);
    console.log('Distribution Data:', distribution);

    const rawCheck = await executeQuery(`
      SELECT DISTINCT ProcessType, StatusID, COUNT(*) as count
      FROM [SmartBoxData].[LASIMRA_Request_SMO]
      GROUP BY ProcessType, StatusID
    `);
    console.log('Raw Process/Status Counts:', rawCheck);

  } catch (error) {
    console.error('Error verifying data:', error);
  }
}

verifyInfrastructureData();
