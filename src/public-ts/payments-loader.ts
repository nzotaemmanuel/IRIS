import { customFetch } from './api.js';

declare const Chart: any;

let isInitialized = false;
let trendChart: any = null;

/**
 * Initialize the Payments Loader
 */
export const initializePaymentsLoader = async () => {
    if (isInitialized) return;
    
    console.log('💰 Initializing Payments Analytics...');
    
    try {
        // Get initial filter values
        const lgaFilter = document.getElementById('payments-lga-filter') as HTMLSelectElement;
        const periodFilter = document.getElementById('payments-period-filter') as HTMLSelectElement;
        const initialPeriod = periodFilter ? periodFilter.value : 'all';
        const initialTrend = initialPeriod === 'all' ? 'month' : 'day';
        const initialFilters = { period: initialPeriod, trendPeriod: initialTrend, lgaId: lgaFilter ? lgaFilter.value : '' };

        // Initial load
        await Promise.all([
            loadPayments({ lgaId: initialFilters.lgaId, period: initialFilters.period }).catch(e => console.error('loadPayments failed:', e)),
            loadPaymentTrend(initialFilters).catch(e => console.error('loadPaymentTrend failed:', e)),
            populateLGADropdown().catch(e => console.error('populateLGADropdown failed:', e))
        ]);
        
        setupEventListeners();
        // Defensive re-load: ensure initial 'All Time' view uses monthly granularity
        // Some SPA timing can cause the initial render to use daily labels; re-request
        // the trend explicitly after a short delay to stabilize the default view.
        setTimeout(() => {
            const period = periodFilter ? periodFilter.value : 'all';
            const trend = period === 'all' ? 'month' : 'day';
            loadPaymentTrend({ period, trendPeriod: trend, lgaId: lgaFilter ? lgaFilter.value : '' });
        }, 350);

        isInitialized = true;
        console.log('💰 Payments Analytics initialized successfully');
    } catch (err) {
        console.error('CRITICAL ERROR during payments initialization:', err);
    }
};

/**
 * Setup global filter event listeners
 */
const setupEventListeners = () => {
    const searchInput = document.getElementById('payments-search') as HTMLInputElement;
    const lgaFilter = document.getElementById('payments-lga-filter') as HTMLSelectElement;
    const periodFilter = document.getElementById('payments-period-filter') as HTMLSelectElement;

    const handleChange = () => {
        const period = periodFilter.value;
        // Automate trend granularity: 
        // - All Time -> Monthly (initially, may flip to yearly)
        // - Current Year -> Monthly
        // - others -> Daily
        const trendPeriod = (period === 'all' || period === 'year') ? 'month' : 'day';

        const filters = {
            lgaId: lgaFilter.value,
            period: period,
            trendPeriod: trendPeriod
        };
        console.log('Filters changed (Auto-Granularity):', filters);
        loadPayments({ lgaId: filters.lgaId, period: filters.period });
        loadPaymentTrend(filters);
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e: any) => {
            const term = e.target.value.toLowerCase();
            filterPayments(term);
        });
    }

    lgaFilter?.addEventListener('change', handleChange);
    periodFilter?.addEventListener('change', handleChange);
};

/**
 * Populate LGA dropdown from API
 */
const populateLGADropdown = async () => {
    const select = document.getElementById('payments-lga-filter') as HTMLSelectElement;
    if (!select) return;

    try {
        const response = await customFetch('/api/geo/lgas');
        const lgas = await response.json();
        
        // Clear existing except first
        while (select.options.length > 1) select.remove(1);

        lgas.forEach((lga: any) => {
            const option = document.createElement('option');
            option.value = lga.ID;
            option.textContent = lga.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Failed to populate LGAs:', err);
    }
};

/**
 * Fetch and render payments with optional filters
 */
const loadPayments = async (filters: any = {}) => {
    const listContainer = document.getElementById('payments-list');
    const revenueDisplay = document.getElementById('payments-total-revenue');
    const countDisplay = document.getElementById('payments-total-count');
    
    if (!listContainer) return;

    listContainer.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-dim);">Loading transactions...</td></tr>';

    const queryParams = new URLSearchParams({
        limit: '50',
        ...filters
    });

    try {
        const response = await customFetch(`/api/payments?${queryParams.toString()}`);
        const { data, summary } = await response.json();

        // Update stats
        if (revenueDisplay) {
            revenueDisplay.textContent = new Intl.NumberFormat('en-NG', { 
                style: 'currency', currency: 'NGN' 
            }).format(summary?.totalRevenue || 0);
        }
        if (countDisplay) {
            countDisplay.textContent = (data?.length || 0).toLocaleString();
        }

        if (!data || data.length === 0) {
            listContainer.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No transactions found for these filters.</td></tr>';
            return;
        }

        renderPayments(data);
    } catch (err) {
        console.error('Failed to load payments:', err);
        listContainer.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--danger); padding: 2rem;">Error loading data.</td></tr>';
    }
};

/**
 * Fetch and render trend analytics
 */
const loadPaymentTrend = async (filters: any = {}) => {
    const canvas = document.getElementById('paymentTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Use provided trendPeriod or calculate based on period to ensure consistency
    const period = filters.period || 'all';
    let trendPeriod = filters.trendPeriod;
    
    // If trendPeriod not explicitly provided, calculate it consistently
    if (!trendPeriod) {
        trendPeriod = period === 'all' ? 'month' : 'day';
    }

    // Force all-time to month initially (may switch to year below)
    if (period === 'all' && !trendPeriod) {
        trendPeriod = 'month';
    }

    // Force 'year' filter to monthly granularity
    if (period === 'year') {
        trendPeriod = 'month';
    }

    // Force relative ranges to day granularity
    if (period === '24h' || period === '7d' || period === '30d') {
        trendPeriod = 'day';
    }

    // Create query params with explicit trendPeriod to ensure backend consistency
    const queryParams = new URLSearchParams({
        ...filters,
        period: period,
        trendPeriod: trendPeriod
    });

    console.log(`loadPaymentTrend: period=${period}, trendPeriod=${trendPeriod}`);

    try {
        const response = await customFetch(`/api/payments/trend?${queryParams.toString()}`);
        const apiData = await response.json();
        
        // DYNAMIC GRANULARITY for "All Time":
        // If All Time is selected with Monthly granularity, but spans multiple years, 
        // toggle to Yearly granularity for a cleaner view.
        if (period === 'all' && trendPeriod === 'month' && apiData.length > 0) {
            const years = new Set(apiData.map((d: any) => String(d.label).substring(0, 4)));
            if (years.size > 1) {
                console.log('All Time data spans multiple years. Switching to Yearly granularity.');
                return loadPaymentTrend({ ...filters, trendPeriod: 'year' });
            }
        }

        // Always ensure a complete timeframe (fill gaps in the series)
        const filledData = fillDataGaps(apiData, period, trendPeriod);

        // Pass 'isEmpty' flag and 'trendPeriod' to renderTrendChart
        renderTrendChart(canvas, filledData, apiData.length === 0, trendPeriod);
    } catch (err) {
        console.error('Failed to load trend data:', err);
    }
};

/**
 * Fills gaps in the trend data to ensure a continuous and complete timeframe
 */
const fillDataGaps = (apiData: any[], period: string, trendPeriod: string): any[] => {
    // Build lookup map keyed by the canonical label format for each trendPeriod:
    //   day   → backend returns DATE → may serialise as "yyyy-MM-ddT00:00:00.000Z"; normalise to first 10 chars
    //   month → backend returns FORMAT(…,'yyyy-MM'); keep first 7 chars
    //   week  → backend returns "yyyy-Wnn" strings; use as-is
    //   year  → backend returns plain year strings ("2024"); use as-is
    const dataMap = new Map();
    if (trendPeriod === 'month') {
        apiData.forEach(d => dataMap.set(String(d.label).substring(0, 7), d.value));
    } else if (trendPeriod === 'day') {
        // DATE values from mssql may carry a time component; strip it to get "yyyy-MM-dd"
        apiData.forEach(d => dataMap.set(String(d.label).substring(0, 10), d.value));
    } else {
        // week ("yyyy-Wnn") and year ("yyyy") labels are already plain strings
        apiData.forEach(d => dataMap.set(String(d.label), d.value));
    }

    console.log(`fillDataGaps: period=${period}, trendPeriod=${trendPeriod}, apiData.length=${apiData.length}, dataMap.size=${dataMap.size}`);

    const filled: any[] = [];
    const now = new Date();

    if (trendPeriod === 'month') {
        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (apiData.length === 0) {
            // No data: show the current year Jan–Dec as an empty skeleton
            const currentYear = now.getFullYear();
            shortMonths.forEach((month, index) => {
                const label = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
                filled.push({ label, displayLabel: month, value: 0 });
            });
            return filled;
        }

        // Build a continuous month skeleton
        const sortedKeys = [...dataMap.keys()].sort();
        const currentYear = now.getFullYear();
        let firstLabel = sortedKeys[0] || `${currentYear}-01`; 
        
        // If "Current Year" filter is selected, always start from January of this year
        if (period === 'year') {
            firstLabel = `${currentYear}-01`;
        }

        const currentLabel = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const endLabel = currentLabel > sortedKeys[sortedKeys.length - 1] ? currentLabel : sortedKeys[sortedKeys.length - 1];

        let [year, month] = firstLabel.split('-').map(Number);
        const [endYear, endMonth] = endLabel.split('-').map(Number);
        const spansMultipleYears = endYear > parseInt(firstLabel.split('-')[0]);

        while (year < endYear || (year === endYear && month <= endMonth)) {
            const label = `${year}-${String(month).padStart(2, '0')}`;
            // Include the year suffix (e.g. "'24") when data spans more than one calendar year
            const displayLabel = spansMultipleYears
                ? `${shortMonths[month - 1]} '${String(year).slice(2)}`
                : shortMonths[month - 1];
            filled.push({ label, displayLabel, value: dataMap.get(label) || 0 });
            month++;
            if (month === 13) { month = 1; year++; }
        }
        return filled;
    }

    if (trendPeriod === 'year') {
        if (apiData.length === 0) {
            filled.push({ label: String(now.getFullYear()), displayLabel: String(now.getFullYear()), value: 0 });
            return filled;
        }

        const sortedYears = [...dataMap.keys()].sort();
        const firstYear = parseInt(sortedYears[0]);
        const currentYear = now.getFullYear();

        // Generate full sequence from first year to current year (No Gaps)
        for (let y = firstYear; y <= currentYear; y++) {
            const label = String(y);
            filled.push({ 
                label: label, 
                displayLabel: label, 
                value: dataMap.get(label) || 0 
            });
        }
        return filled;
    }

    if (period === '24h') {
        for (let i = 23; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0]; // "yyyy-MM-dd"
            const hour = d.getHours();
            filled.push({ 
                label: dateStr, 
                displayLabel: `${String(hour).padStart(2, '0')}:00`,
                value: dataMap.get(dateStr) || 0 
            });
        }
    } else if (period === '7d' || (period === 'all' && trendPeriod === 'day')) {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0]; // "yyyy-MM-dd"
            // Use 'short' weekday labels (e.g., "Wed") as visible in the user's screenshot
            const displayLabel = d.toLocaleDateString('en-GB', { weekday: 'short' });
            filled.push({ 
                label: dateStr, 
                displayLabel: displayLabel,
                value: dataMap.get(dateStr) || 0 
            });
        }
    } else if (period === '30d') {
        const referenceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        for (let i = 29; i >= 0; i--) {
            const d = new Date(referenceDate.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0]; // "yyyy-MM-dd"
            const displayLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            
            filled.push({ 
                label: dateStr, 
                displayLabel: displayLabel,
                value: dataMap.get(dateStr) || 0 
            });
        }
    } else {
        // Default to original data if no skeleton matches
        return apiData;
    }
    
    return filled;
};

/**
 * Helper to show/hide "No Data" overlay on chart
 */
const updateChartOverlay = (containerId: string, show: boolean) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    let overlay = container.querySelector('.chart-no-data-overlay');
    if (show) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'chart-no-data-overlay';
            overlay.innerHTML = `
                <h4>NO AVAILABLE DATA</h4>
                <p>No revenue events recorded for this period</p>
            `;
            container.appendChild(overlay);
        }
    } else {
        if (overlay) overlay.remove();
    }
};

/**
 * Render Chart.js Trend Analytics
 */
const renderTrendChart = (canvas: HTMLCanvasElement, data: any[], isEmpty: boolean = false, trendPeriod: string = 'day') => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle overlay
    updateChartOverlay('trend-chart-container', isEmpty);

    // Use global Chart if available
    const ChartLib = (window as any).Chart || Chart;
    if (!ChartLib) {
        console.error('Chart.js library not found!');
        return;
    }

    // Destroy previous chart instance to prevent flickering
    if (trendChart) {
        trendChart.destroy();
        trendChart = null;
    }

    if (!data || data.length === 0) {
        // Draw "No Data" message on canvas if needed
        console.warn('No data available for chart rendering');
        return;
    }

    // Log for debugging
    console.log('Rendering chart with trendPeriod:', trendPeriod, 'data points:', data.length);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const isDark = !isLight;
    const primaryColor = '#6366f1';
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.2)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    // Prepare labels consistently using displayLabel from skeleton data
    const labels = data.map(d => {
        if (d.displayLabel) return d.displayLabel;
        
        // Fallback label generation (should rarely happen with filled data)
        if (trendPeriod === 'day') return new Date(d.label).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        if (trendPeriod === 'month') {
            const date = new Date(d.label + '-01');
            return date.toLocaleDateString('en-GB', { month: 'short' });
        }
        if (trendPeriod === 'week') return d.label;
        return d.label;
    });

    // Extract data values
    const dataValues = data.map(d => d.value || 0);
    
    console.log('Chart labels:', labels.slice(0, 5), '... (showing first 5)');
    console.log('Chart data values:', dataValues.slice(0, 5), '... (showing first 5)');

    trendChart = new ChartLib(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Payment Amount',
                data: dataValues,
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.85)' : 'rgba(99, 102, 241, 0.75)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 5,
                barPercentage: 0.85,  // Increased to fit 30 bars better
                categoryPercentage: 0.9,
                maxBarThickness: 30   // Slightly thinner to fit 30 points
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0  // Disable animation to prevent flickering
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: isDark ? '#0f172a' : '#fff',
                    titleColor: isDark ? '#f8fafc' : '#0f172a',
                    bodyColor: isDark ? '#94a3b8' : '#475569',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context: any) => {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                    ticks: { 
                        color: isDark ? '#94a3b8' : '#475569',
                        font: { family: 'Inter', size: 11 },
                        callback: (value: any) => '₦' + (value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value)
                    }
                },
                x: {
                    type: 'category',
                    grid: { display: false },
                    ticks: { 
                        color: isDark ? '#94a3b8' : '#475569',
                        font: { family: 'Inter', size: 10 }, // Smaller font for dense labels
                        maxRotation: 45,
                        minRotation: 0,
                        autoSkip: false, // Ensure NO gaps in labels as requested
                        autoSkipPadding: 2,
                        callback: (value: any) => {
                            if (typeof value === 'string') return value;
                            return labels[value as number];
                        }
                    }
                }
            }
        }
    });

    console.log('Chart rendered successfully');
};

/**
 * Render payments table rows
 */
const renderPayments = (payments: any[]) => {
    const listContainer = document.getElementById('payments-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = payments.map(p => {
        const rawStatus = (p.Status || p.PaymentStatus || '').toLowerCase();
        const statusClass = rawStatus === 'approved' || rawStatus === 'success' || rawStatus === 'successful' ? 'success' : 
                           (rawStatus === 'pending' ? 'pending' : 'failed');
        
        // Format date
        const date = p.Date ? new Date(p.Date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) : 'N/A';
        
        // Format currency
        const amountDisplay = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(p.Amount || 0);

        return `
            <tr>
                <td><span class="ref-badge">${p.Reference || 'N/A'}</span></td>
                <td><div style="font-weight: 500;">${p.Customer || 'Guest'}</div></td>
                <td><span style="font-size: 0.85rem; color: var(--text-dim);">${p.LGA || 'N/A'}</span></td>
                <td><span style="font-weight: 700; color: var(--accent-cyan);">${amountDisplay}</span></td>
                <td><span style="font-size: 0.8rem; opacity: 0.7;">${p.Mode || 'Direct'}</span></td>
                <td><span style="font-size: 0.85rem;">${date}</span></td>
                <td><span class="status-badge ${statusClass}">${p.Status || p.PaymentStatus || 'Unknown'}</span></td>
            </tr>
        `;
    }).join('');
};

/**
 * Simple client-side filter for current view
 */
const filterPayments = (term: string) => {
    const rows = document.querySelectorAll('#payments-list tr');
    rows.forEach(row => {
        const text = (row as HTMLElement).innerText.toLowerCase();
        (row as HTMLElement).style.display = text.includes(term) ? '' : 'none';
    });
};
