import { executeQuery } from './src/config/db';
async function listTables() {
  try {
    const r = await executeQuery("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
    process.stdout.write(JSON.stringify(r.map((t: any) => t.TABLE_NAME)));
  } catch (e: any) {
    process.stderr.write(e.message);
  }
}
listTables();
