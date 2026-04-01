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
        const lgaFilter = document.getElementById('structures-lga-filter') as HTMLSelectElement;
        const periodFilter = document.getElementById('structures-period-filter') as HTMLSelectElement;
        
        const initialFilters = {
            period: periodFilter ? periodFilter.value : 'all',
            lgaId: lgaFilter ? lgaFilter.value : '',
            type: activeTab
        };

        // Initial Data Loads
        await Promise.all([
            loadStructureStats(initialFilters),
            loadStructureTrend(initialFilters),
            loadStructureList(initialFilters),
            populateLGADropdown()
        ]);

        setupEventListeners();

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
    const lgaFilter = document.getElementById('structures-lga-filter') as HTMLSelectElement;
    const periodFilter = document.getElementById('structures-period-filter') as HTMLSelectElement;
    const searchInput = document.getElementById('structures-search') as HTMLInputElement;
    const tabs = document.querySelectorAll('.table-tab');

    const handleFilterChange = () => {
        const filters = {
            lgaId: lgaFilter.value,
            period: periodFilter.value,
            type: activeTab
        };
        loadStructureStats(filters);
        loadStructureTrend(filters);
        loadStructureList(filters);
    };

    lgaFilter?.addEventListener('change', handleFilterChange);
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
            
            // Reload list for new tab
            loadStructureList({
                lgaId: lgaFilter.value,
                period: periodFilter.value,
                type: activeTab
            });
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
 * Populate LGA dropdown
 */
const populateLGADropdown = async () => {
    const select = document.getElementById('structures-lga-filter') as HTMLSelectElement;
    if (!select) return;

    try {
        const response = await customFetch('/api/geo/lgas');
        const lgas = await response.json();
        
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
 * Load Summary Stats
 */
const loadStructureStats = async (filters: any) => {
    const rowValue = document.getElementById('structures-row-count');
    const mastValue = document.getElementById('structures-mast-count');

    try {
        const query = new URLSearchParams(filters).toString();
        const response = await customFetch(`/api/structures/stats?${query}`);
        const stats = await response.json();

        if (rowValue) rowValue.textContent = stats.row.toLocaleString();
        if (mastValue) mastValue.textContent = stats.mast.toLocaleString();
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

    // Automate trend period based on selection
    const trendPeriod = (filters.period === 'all' || filters.period === 'year') ? 'month' : 'day';
    
    try {
        const query = new URLSearchParams({ ...filters, trendPeriod }).toString();
        const response = await customFetch(`/api/structures/trend?${query}`);
        const apiData = await response.json();

        // Pass to specialized trend rendering (similar to payments)
        renderTrendChart(canvas, apiData, filters.period, trendPeriod);
    } catch (err) {
        console.error('Failed to load structure trend:', err);
    }
};

/**
 * Dynamic Trend Chart Rendering
 */
const renderTrendChart = (canvas: HTMLCanvasElement, apiData: any[], period: string, trendPeriod: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ChartLib = (window as any).Chart || Chart;
    if (!ChartLib) return;

    if (structureTrendChart) {
        structureTrendChart.destroy();
    }

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    
    // Fill gaps logic (simplified for initial implementation, reusable from payments-loader if exported)
    const labels = apiData.map(d => d.label);
    const values = apiData.map(d => d.value);

    structureTrendChart = new ChartLib(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'New Registrations',
                data: values,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#6366f1',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: isDark ? '#94a3b8' : '#475569' }
                },
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: isDark ? '#94a3b8' : '#475569',
                        maxRotation: 45
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

    listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">Loading data...</td></tr>';

    try {
        const query = new URLSearchParams(filters).toString();
        const response = await customFetch(`/api/structures?${query}`);
        const { data } = await response.json();

        if (!data || data.length === 0) {
            listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No structures found for these filters.</td></tr>';
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

    // Refresh icons
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
