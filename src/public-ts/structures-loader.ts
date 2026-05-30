import { customFetch } from './api.js';

declare const Chart: any;

let isInitialized = false;
let structureTrendChart: any = null;
let activeTab: 'row' | 'mast' = 'mast';

/**
 * Initialize the Structures Loader
 */
export const initializeStructuresLoader = async () => {
    if (isInitialized) return;
    
    console.log('📡 Initializing Infrastructure Analytics...');
    
    try {
        const periodFilter = document.getElementById('structures-period-filter') as HTMLSelectElement;
        const initialPeriod = periodFilter ? periodFilter.value : 'all';
        const initialTrend = (initialPeriod === 'all' || initialPeriod === 'year') ? 'month' : 'day';

        const initialFilters = {
            period: initialPeriod,
            trendPeriod: initialTrend,
            lgaId: '',
            type: activeTab
        };

        // Initial Data Loads
        await Promise.all([
            loadStructureStats(initialFilters),
            loadStructureTrend(initialFilters),
            loadStructureList(initialFilters)
        ]);

        setupEventListeners();

        // Stabilization delay for initial trend render
        setTimeout(() => {
            const periodFilter = document.getElementById('structures-period-filter') as HTMLSelectElement;
            const period = periodFilter ? periodFilter.value : 'all';
            const trend = (period === 'all' || period === 'year') ? 'month' : 'day';
            loadStructureTrend({ period, trendPeriod: trend, lgaId: '', type: activeTab });
        }, 350);

        isInitialized = true;
        console.log('📡 Infrastructure Analytics initialized');
    } catch (err) {
        console.error('Failed to initialize structures dashboard:', err);
    }
};

/**
 * Setup Event Listeners for Filters and Tabs
 */
const setupEventListeners = () => {
    const periodFilter = document.getElementById('structures-period-filter') as HTMLSelectElement;
    const searchInput = document.getElementById('structures-search') as HTMLInputElement;
    const tabs = document.querySelectorAll('.table-tab');

    const handleFilterChange = () => {
        if (!periodFilter) return;
        const period = periodFilter.value;
        const trendPeriod = (period === 'all' || period === 'year') ? 'month' : 'day';
        
        const filters = {
            lgaId: '',
            period: period,
            trendPeriod: trendPeriod,
            type: activeTab
        };
        loadStructureStats(filters);
        loadStructureTrend(filters);
        loadStructureList(filters);
    };

    // lgaFilter removed
    periodFilter?.addEventListener('change', handleFilterChange);

    searchInput?.addEventListener('input', (e: any) => {
        const term = e.target.value.toLowerCase();
        filterTable(term);
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = (tab as HTMLElement).dataset.type as 'row' | 'mast';
            
            // Update table header based on tab
            updateTableHeader(activeTab);
            
            const filters = {
                lgaId: '',
                period: periodFilter ? periodFilter.value : 'all',
                type: activeTab
            };
            
            // Reload list and stats for new tab
            loadStructureList(filters);
            loadStructureStats(filters);
        });
    });
};

/**
 * Update Table Headers based on active tab
 */
const updateTableHeader = (type: 'row' | 'mast') => {
    const headerRow = document.getElementById('structures-table-header');
    if (!headerRow) return;

    if (type === 'row') {
        headerRow.innerHTML = `
            <th>ID / Reference</th>
            <th>LGA Name</th>
            <th>Project Category</th>
            <th>Reg. Date</th>
            <th>Actions</th>
        `;
    } else {
        headerRow.innerHTML = `
            <th>Site ID</th>
            <th>LGA Name</th>
            <th>Structure Type</th>
            <th>Reg. Date</th>
            <th>Actions</th>
        `;
    }
};



/**
 * Load Summary Stats
 */
const loadStructureStats = async (filters: any) => {
    const rowValue = document.getElementById('structures-row-count');
    const mastValue = document.getElementById('structures-mast-count');

    try {
        const query = new URLSearchParams(filters).toString();
        const response = await customFetch(`/api/structures/stats?${query}`);
        const stats = await response.json();

        if (stats && !stats.error) {
            if (rowValue) rowValue.textContent = (stats.row || 0).toLocaleString();
            if (mastValue) mastValue.textContent = (stats.mast || 0).toLocaleString();
        } else {
            if (rowValue) rowValue.textContent = '0';
            if (mastValue) mastValue.textContent = '0';
        }
    } catch (err) {
        console.error('Failed to load structure stats:', err);
    }
};

/**
 * Load and Render Trend Chart
 */
const loadStructureTrend = async (filters: any) => {
    const canvas = document.getElementById('structureTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    const period = filters.period || 'all';
    let trendPeriod = filters.trendPeriod;
    
    if (!trendPeriod) {
        trendPeriod = (period === 'all' || period === 'year') ? 'month' : 'day';
    }

    try {
        const query = new URLSearchParams({ ...filters, trendPeriod }).toString();
        const response = await customFetch(`/api/structures/trend?${query}`);
        const apiData = await response.json();

        if (apiData && apiData.error) {
            console.error('API Error in trend:', apiData.error);
            renderTrendChart(canvas, [], true, trendPeriod);
            return;
        }

        // Dynamic Granularity for All Time
        if (period === 'all' && trendPeriod === 'month' && apiData && apiData.length > 0) {
            const years = new Set(apiData.map((d: any) => String(d.label).substring(0, 4)));
            if (years.size > 1) {
                return loadStructureTrend({ ...filters, trendPeriod: 'year' });
            }
        }

        const filledData = fillDataGaps(apiData, period, trendPeriod);
        renderTrendChart(canvas, filledData, apiData.length === 0, trendPeriod);
    } catch (err) {
        console.error('Failed to load structure trend:', err);
    }
};

/**
 * Skeleton Filling Logic (Parity with Payments)
 */
const fillDataGaps = (apiData: any[], period: string, trendPeriod: string): any[] => {
    const dataMap = new Map();
    if (trendPeriod === 'month') {
        apiData.forEach(d => dataMap.set(String(d.label).substring(0, 7), d.value));
    } else if (trendPeriod === 'day') {
        apiData.forEach(d => dataMap.set(String(d.label).substring(0, 10), d.value));
    } else {
        apiData.forEach(d => dataMap.set(String(d.label), d.value));
    }

    const filled: any[] = [];
    const now = new Date();

    if (trendPeriod === 'month') {
        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        if (apiData.length === 0) {
            const currentYear = now.getFullYear();
            shortMonths.forEach((month, index) => {
                const label = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
                filled.push({ label, displayLabel: month, value: 0 });
            });
            return filled;
        }

        const sortedKeys = [...dataMap.keys()].sort();
        const currentYear = now.getFullYear();
        let firstLabel = sortedKeys[0] || `${currentYear}-01`; 
        
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
        for (let y = firstYear; y <= currentYear; y++) {
            const label = String(y);
            filled.push({ label, displayLabel: label, value: dataMap.get(label) || 0 });
        }
        return filled;
    }

    if (period === '24h') {
        for (let i = 23; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0];
            const hour = d.getHours();
            filled.push({ label: dateStr, displayLabel: `${String(hour).padStart(2, '0')}:00`, value: dataMap.get(dateStr) || 0 });
        }
    } else if (period === '7d' || (period === 'all' && trendPeriod === 'day')) {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0];
            const displayLabel = d.toLocaleDateString('en-GB', { weekday: 'short' });
            filled.push({ label: dateStr, displayLabel: displayLabel, value: dataMap.get(dateStr) || 0 });
        }
    } else if (period === '30d') {
        const referenceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        for (let i = 29; i >= 0; i--) {
            const d = new Date(referenceDate.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0];
            const displayLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            filled.push({ label: dateStr, displayLabel: displayLabel, value: dataMap.get(dateStr) || 0 });
        }
    } else {
        return apiData;
    }
    
    return filled;
};

/**
 * Overlay logic
 */
const updateChartOverlay = (containerId: string, show: boolean) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    let overlay = container.querySelector('.chart-no-data-overlay');
    if (show) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'chart-no-data-overlay';
            overlay.innerHTML = `<h4>NO AVAILABLE DATA</h4><p>No asset registrations for this period</p>`;
            container.appendChild(overlay);
        }
    } else {
        if (overlay) overlay.remove();
    }
};

/**
 * Render Chart.js Trend Analytics (Bar type for parity with Payments)
 */
const renderTrendChart = (canvas: HTMLCanvasElement, data: any[], isEmpty: boolean = false, trendPeriod: string = 'day') => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    updateChartOverlay('structure-trend-container', isEmpty);

    const ChartLib = (window as any).Chart || Chart;
    if (!ChartLib) return;

    if (structureTrendChart) {
        structureTrendChart.destroy();
    }

    if (!data || data.length === 0) return;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const isDark = !isLight;
    const primaryColor = '#6366f1';
    
    const labels = data.map(d => d.displayLabel || d.label);
    const dataValues = data.map(d => d.value || 0);

    structureTrendChart = new ChartLib(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'New Registrations',
                data: dataValues,
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.85)' : 'rgba(99, 102, 241, 0.75)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 5,
                barPercentage: 0.85,
                categoryPercentage: 0.9,
                maxBarThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
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
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                    ticks: { 
                        color: isDark ? '#94a3b8' : '#475569',
                        font: { family: 'Inter', size: 11 }
                    }
                },
                x: {
                    type: 'category',
                    grid: { display: false },
                    ticks: { 
                        color: isDark ? '#94a3b8' : '#475569',
                        font: { family: 'Inter', size: 10 },
                        maxRotation: 45,
                        minRotation: 0,
                        autoSkip: false
                    }
                }
            }
        }
    });
};

/**
 * Load and Render Structures List
 */
const loadStructureList = async (filters: any) => {
    const listContainer = document.getElementById('structures-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-dim);">Loading data...</td></tr>';

    try {
        const query = new URLSearchParams(filters).toString();
        const response = await customFetch(`/api/structures?${query}`);
        const { data } = await response.json();

        if (!data || data.length === 0) {
            listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-muted);">No structures found for these filters.</td></tr>';
            return;
        }

        renderStructureRows(data);
    } catch (err) {
        console.error('Failed to load structures list:', err);
        listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--danger); padding: 2rem;">Error loading data.</td></tr>';
    }
};

/**
 * Render List Rows
 */
const renderStructureRows = (data: any[]) => {
    const listContainer = document.getElementById('structures-list');
    if (!listContainer) return;

    listContainer.innerHTML = data.map(s => {
        const date = s.Date ? new Date(s.Date).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }) : 'N/A';

        return `
            <tr>
                <td><span class="ref-badge">${s.SiteID || 'N/A'}</span></td>
                <td><span style="font-weight: 500;">${s.LGA || 'N/A'}</span></td>
                <td><span class="status-badge" style="background: rgba(99, 102, 241, 0.1); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.2);">${s.Category || 'Unknown'}</span></td>
                <td><span style="font-size: 0.85rem;">${date}</span></td>
                <td class="action-btns">
                    <button class="action-btn" title="View Details"><i data-lucide="eye"></i></button>
                    <button class="action-btn" title="View on Map"><i data-lucide="map-pin"></i></button>
                </td>
            </tr>
        `;
    }).join('');

    if ((window as any).lucide) {
        (window as any).lucide.createIcons();
    }
};

/**
 * Client-side search filter
 */
const filterTable = (term: string) => {
    const rows = document.querySelectorAll('#structures-list tr');
    rows.forEach(row => {
        const text = (row as HTMLElement).innerText.toLowerCase();
        (row as HTMLElement).style.display = text.includes(term) ? '' : 'none';
    });
};
