import { executeQuery } from './src/config/db';

async function test() {
  try {
    const q = await executeQuery('SELECT PaymentMode, COUNT(*) as c, SUM(AmountPaid) as t FROM [SmartBoxData].[LASIMRA_Payment_SMO] GROUP BY PaymentMode');
    console.log(q);
  } catch(e:any) {
    console.error('Error:', e.message);
  }
}
test();
