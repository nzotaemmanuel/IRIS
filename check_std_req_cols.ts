
import { executeQuery } from './src/config/db';
async function f() {
  try {
    const r = await executeQuery("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LASIMRA_StandardRequest_SMO'");
    console.log('StandardRequest Columns:', r.map((c: any) => c.COLUMN_NAME).join(', '));
  } catch(e: any) {
    console.error(e.message);
  }
}
f();
