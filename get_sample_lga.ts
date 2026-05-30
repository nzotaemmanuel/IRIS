
import { executeQuery } from './src/config/db';
async function f() {
  try {
    const r = await executeQuery("SELECT TOP 1 LocalGovernmentArea FROM [SmartBoxData].[LASIMRA_RowRequest_SMO]");
    console.log('Sample LGA ID:', r[0]);
  } catch(e: any) {
    console.error(e.message);
  }
}
f();
