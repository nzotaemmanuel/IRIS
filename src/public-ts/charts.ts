import { customFetch } from './api.js';

declare const Chart: any;

let trendChartInstance: any = null;
let statusChartInstance: any = null;
let typeChartInstance: any = null;

export const renderCharts = async () => {
    try {
        // Fetch Trends
        const trendRes = await customFetch('/api/stats/trends');
        if (trendRes.ok) {
            const trendData = await trendRes.json();
            renderTrendChart(trendData);
        }

        // Fetch Distribution
        const distRes = await customFetch('/api/stats/distribution');
        if (distRes.ok) {
            const distData = await distRes.json();
            renderStatusChart(distData.statusBreakdown);
            renderTypeChart(distData.typeDistribution);
        }
    } catch (err) {
        console.error("Failed to load chart data", err);
    }
};

const getChartTheme = () => ({
    color: '#94a3b8', // text-muted
    font: { family: "'Inter', sans-serif", size: 11 },
    grid: { color: 'rgba(255, 255, 255, 0.05)' }
});

const renderTrendChart = (data: any[]) => {
    const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
    if (trendChartInstance) trendChartInstance.destroy();

    const theme = getChartTheme();

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.Month),
            datasets: [{
                label: 'Permit Revenue',
                data: data.map(d => d.PermitCount), // Map to real data fields if needed
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#6366f1',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: theme.grid,
                    ticks: { color: theme.color, font: theme.font }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: theme.color, font: theme.font }
                }
            }
        }
    });
};

const renderStatusChart = (data: any[]) => {
    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (statusChartInstance) statusChartInstance.destroy();

    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.status),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6366f1'],
                borderWidth: 0,
                hoverOffset: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: { color: '#94a3b8', usePointStyle: true, font: { size: 12 } }
                }
            }
        }
    });
};

const renderTypeChart = (data: any[]) => {
    const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
    if (typeChartInstance) typeChartInstance.destroy();

    const theme = getChartTheme();

    typeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.category),
            datasets: [{
                label: 'Volume',
                data: data.map(d => d.count),
                backgroundColor: '#6366f1',
                borderRadius: 6,
                hoverBackgroundColor: '#4f46e5'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { 
                    grid: theme.grid,
                    ticks: { color: theme.color, font: theme.font }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: theme.color, font: theme.font }
                }
            }
        }
    });
};
