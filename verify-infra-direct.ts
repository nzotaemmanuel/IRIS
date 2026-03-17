import { executeQuery } from './src/config/db';

async function verifyInfrastructureDirect() {
  console.log('--- Verifying Infrastructure (Directly from Requests Table) ---');
  
  try {
    const query = `
      SELECT 
        CASE WHEN r.ProcessType = 1 THEN 'MAST'
             WHEN r.ProcessType = 2 THEN 'RoW'
             ELSE 'Other' END as label,
        COUNT(*) as value
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r
      WHERE (r.ProcessType = 1 AND r.StatusID = 28) 
         OR (r.ProcessType = 2 AND r.StatusID = 13)
      GROUP BY r.ProcessType
    `;
    const result = await executeQuery(query);
    console.log('Infrastructure Distribution:', result);

    const totalQuery = `
      SELECT COUNT(*) as total
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r
      WHERE (r.ProcessType = 1 AND r.StatusID = 28) 
         OR (r.ProcessType = 2 AND r.StatusID = 13)
    `;
    const total = await executeQuery(totalQuery);
    console.log('Total Approved:', total);

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

verifyInfrastructureDirect();
