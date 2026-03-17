import { executeQuery } from './src/config/db';

async function verifyNoRequestTitle() {
  console.log('--- Verifying Removal of RequestTitle Identification ---');
  
  try {
    const trendQuery = `
      SELECT FORMAT(r.ApplicationDate, 'yyyy-MM') as month, COUNT(*) as value
      FROM [SmartBoxData].[LASIMRA_Request_SMO] r
      WHERE r.ProcessType IN (1, 2)
      GROUP BY FORMAT(r.ApplicationDate, 'yyyy-MM')
      ORDER BY month ASC
    `;
    const trend = await executeQuery(trendQuery);
    console.log('Trend Data (using ProcessType):', trend.length, 'months found');
    
    // Check if any records are returned
    if (trend.length > 0) {
      console.log('Sample Trend Record:', trend[0]);
    } else {
      console.log('No trend data found with ProcessType IN (1, 2). Check mappings.');
    }

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

verifyNoRequestTitle();
