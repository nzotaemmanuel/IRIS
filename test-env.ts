console.log('Environment Verification: Start');
import { poolPromise } from './src/config/db';
async function test() {
  console.log('Testing connection...');
  try {
    const pool = await poolPromise;
    if (pool) {
      console.log('Connection successful');
    } else {
      console.log('Connection failed (mock mode likely)');
    }
  } catch (err: any) {
    console.error('Error during connection:', err.message);
  }
}
test();
