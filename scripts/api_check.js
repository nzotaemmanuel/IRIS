(async () => {
  try {
    const base = 'http://localhost:3000';
    const fetch = global.fetch || require('node-fetch');

    const resAll = await fetch(`${base}/api/payments/trend?period=all&trendPeriod=month`);
    const dataAll = await resAll.json();
    console.log('DEBUG all response type:', typeof dataAll);
    console.log('DEBUG all response sample:', Array.isArray(dataAll) ? dataAll.slice(0,3) : dataAll);
    const allLabelsOk = Array.isArray(dataAll) && dataAll.every(d => /^\d{4}-\d{2}$/.test(String(d.label)));

    const res7 = await fetch(`${base}/api/payments/trend?period=7d&trendPeriod=day`);
    const data7 = await res7.json();
    console.log('DEBUG 7d response type:', typeof data7);
    console.log('DEBUG 7d response sample:', Array.isArray(data7) ? data7.slice(0,3) : data7);
    const sevenLabelsOk = Array.isArray(data7) && data7.every(d => /^\d{4}-\d{2}-\d{2}$/.test(String(d.label)));

    console.log('API_CHECK_RESULT', { allCount: Array.isArray(dataAll) ? dataAll.length : null, allLabelsOk, sevenCount: Array.isArray(data7) ? data7.length : null, sevenLabelsOk });
    process.exit(allLabelsOk && sevenLabelsOk ? 0 : 2);
  } catch (err) {
    console.error('API check failed:', err);
    process.exit(3);
  }
})();
