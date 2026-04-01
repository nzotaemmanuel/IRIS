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

    // Open root to perform login, then navigate to payments
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    // Wait for login form
    await page.waitForSelector('#loginForm', { timeout: 8000 });

    // Fill credentials and submit (test account provided)
    await page.type('#email', 'nzotaemmanuel16@gmail.com', { delay: 30 });
    await page.type('#password', 'Admin@lasimra123', { delay: 30 });
    await Promise.all([
      page.click('#loginForm button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {})
    ]);

    // Wait until app wrapper is visible
    await page.waitForFunction(() => {
      const el = document.getElementById('appWrapper');
      return el && !el.classList.contains('hidden');
    }, { timeout: 8000 });

    // Activate Payments view via nav (SPA switchView triggers loader)
    await page.click('.nav-item[data-view="payments"]');
    await page.waitForSelector('#paymentTrendChart', { timeout: 10000 });
    // Give the payments loader some extra time to fetch and render the chart
    await new Promise(r => setTimeout(r, 1500));

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

    // Persist debug info and labels
    fs.writeFileSync('screenshots/page_debug_all.json', JSON.stringify(pageDebugAll, null, 2));
    fs.writeFileSync('screenshots/page_debug_7d.json', JSON.stringify(pageDebug7d, null, 2));
    const findChartLabels = (debug) => {
      try {
        if (debug && Array.isArray(debug.canvasChecks)) {
          const entry = debug.canvasChecks.find(c => c.id === 'paymentTrendChart');
          return entry && entry.labels ? entry.labels : '';
        }
      } catch (e) {}
      return '';
    };

    const allLabels = findChartLabels(pageDebugAll);
    const sevenLabels = findChartLabels(pageDebug7d);

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
