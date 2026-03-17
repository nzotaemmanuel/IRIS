import { executeQuery } from './src/config/db';

async function testProcessTypeID() {
  console.log('--- Testing ProcessTypeID ---');
  try {
    const result = await executeQuery(`
      SELECT TOP 1 ProcessTypeID, StatusID 
      FROM [SmartBoxData].[LASIMRA_Request_SMO]
    `);
    console.log('Success with ProcessTypeID:', result);
  } catch (error: any) {
    console.error('Error with ProcessTypeID:', error.message);
    
    console.log('\n--- Testing ProcessType ---');
    try {
      const result = await executeQuery(`
        SELECT TOP 1 ProcessType, StatusID 
        FROM [SmartBoxData].[LASIMRA_Request_SMO]
      `);
      console.log('Success with ProcessType:', result);
    } catch (err: any) {
      console.error('Error with ProcessType:', err.message);
    }
  }
}

testProcessTypeID();
