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
        // Initial load
        await Promise.all([
            loadPayments().catch(e => console.error('loadPayments failed:', e)),
            loadPaymentTrend().catch(e => console.error('loadPaymentTrend failed:', e)),
            populateLGADropdown().catch(e => console.error('populateLGADropdown failed:', e))
        ]);
        
        setupEventListeners();
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
    const startDate = document.getElementById('payments-start-date') as HTMLInputElement;
    const endDate = document.getElementById('payments-end-date') as HTMLInputElement;
    const periodSelector = document.getElementById('payments-trend-period') as HTMLSelectElement;

    const handleChange = () => {
        const filters = {
            lgaId: lgaFilter.value,
            startDate: startDate.value,
            endDate: endDate.value
        };
        console.log('Filters changed:', filters);
        loadPayments(filters);
        loadPaymentTrend({ ...filters, period: periodSelector.value });
    };

    periodSelector?.addEventListener('change', () => {
        loadPaymentTrend({
            lgaId: lgaFilter.value,
            startDate: startDate.value,
            endDate: endDate.value,
            period: periodSelector.value
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e: any) => {
            const term = e.target.value.toLowerCase();
            filterPayments(term);
        });
    }

    lgaFilter?.addEventListener('change', handleChange);
    startDate?.addEventListener('change', handleChange);
    endDate?.addEventListener('change', handleChange);
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

    const queryParams = new URLSearchParams(filters);

    try {
        const response = await customFetch(`/api/payments/trend?${queryParams.toString()}`);
        const data = await response.json();
        
        renderTrendChart(canvas, data);
    } catch (err) {
        console.error('Failed to load trend data:', err);
    }
};

/**
 * Render Chart.js Trend Analytics
 */
const renderTrendChart = (canvas: HTMLCanvasElement, data: any[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use global Chart if available
    const ChartLib = (window as any).Chart || Chart;
    if (!ChartLib) {
        console.error('Chart.js library not found!');
        return;
    }

    if (trendChart) {
        trendChart.destroy();
    }

    if (!data || data.length === 0) {
        // Draw "No Data" message on canvas if needed
        return;
    }

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const isDark = !isLight;
    const primaryColor = '#6366f1';
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.2)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    const periodSelector = document.getElementById('payments-trend-period') as HTMLSelectElement;
    const period = periodSelector?.value || 'day';

    trendChart = new ChartLib(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => {
                if (period === 'day') return new Date(d.label).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                if (period === 'month') return d.label; // yyyy-MM
                if (period === 'week') return d.label; // yyyy-Wxx
                return d.label; // yyyy
            }),
            datasets: [{
                label: 'Payment Amount',
                data: data.map(d => d.value),
                borderColor: primaryColor,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: primaryColor,
                pointBorderColor: isDark ? '#020617' : '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                    grid: { display: false },
                    ticks: { 
                        color: isDark ? '#94a3b8' : '#475569',
                        font: { family: 'Inter', size: 11 }
                    }
                }
            }
        }
    });
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
