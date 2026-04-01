const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    let lastChartLabels = '';
    page.on('console', msg => {
      const text = msg.text();
      if (text.startsWith('Chart labels:')) {
        lastChartLabels = text;
      }
      // Mirror page logs to Node console for debugging
      console.log('PAGE_LOG>', text);
    });

    // Ensure screenshots directory exists
    if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

    // Open payments view
    await page.goto('http://localhost:3000/payments', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#paymentTrendChart', { timeout: 5000 });

    // Select All Time and capture (longer wait to allow Chart.js to render)
    await page.select('#payments-period-filter', 'all');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshots/all-time.png', fullPage: false });

    // Collect Chart.js debug info and try to read labels
    const pageDebugAll = await page.evaluate(() => {
      try {
        const canvases = Array.from(document.querySelectorAll('canvas'));
        const hasChart = !!window.Chart;
        const hasGetChart = !!(window.Chart && window.Chart.getChart);
        const canvasChecks = canvases.map((canvas, idx) => {
          let labels = '';
          let hasInstance = false;
          try {
            if (hasGetChart) {
              const c = window.Chart.getChart(canvas);
              if (c && c.data && c.data.labels) {
                hasInstance = true;
                labels = JSON.stringify(c.data.labels);
              }
            }
          } catch (e) {
            labels = '';
          }
          return { idx, id: canvas.id || null, hasInstance, labels };
        });
        return { hasChart, hasGetChart, canvasChecks };
      } catch (e) {
        return { error: String(e) };
      }
    });

    // Select Last 7 Days and capture
    await page.select('#payments-period-filter', '7d');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshots/7d.png', fullPage: false });

    const pageDebug7d = await page.evaluate(() => {
      try {
        const canvases = Array.from(document.querySelectorAll('canvas'));
        const hasChart = !!window.Chart;
        const hasGetChart = !!(window.Chart && window.Chart.getChart);
        const canvasChecks = canvases.map((canvas, idx) => {
          let labels = '';
          let hasInstance = false;
          try {
            if (hasGetChart) {
              const c = window.Chart.getChart(canvas);
              if (c && c.data && c.data.labels) {
                hasInstance = true;
                labels = JSON.stringify(c.data.labels);
              }
            }
          } catch (e) {
            labels = '';
          }
          return { idx, id: canvas.id || null, hasInstance, labels };
        });
        return { hasChart, hasGetChart, canvasChecks };
      } catch (e) {
        return { error: String(e) };
      }
    });

    await browser.close();

    // Persist debug info and labels
    fs.writeFileSync('screenshots/page_debug_all.json', JSON.stringify(pageDebugAll, null, 2));
    fs.writeFileSync('screenshots/page_debug_7d.json', JSON.stringify(pageDebug7d, null, 2));

    const allLabels = pageDebugAll.labels || '';
    const sevenLabels = pageDebug7d.labels || '';

    await browser.close();

    const result = { all: allLabels, seven: sevenLabels };
    fs.writeFileSync('screenshots/labels.json', JSON.stringify(result, null, 2));

    const okAll = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(allLabels);
    const ok7 = /Mon|Tue|Wed|Thu|Fri|Sat|Sun|\d{1,2}/.test(sevenLabels);

    console.log('UI_CHECK_RESULT', { okAll, ok7 });
    process.exit(okAll && ok7 ? 0 : 2);
  } catch (err) {
    console.error('UI check failed:', err);
    process.exit(3);
  }
})();
