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

const renderTrendChart = (data: any[]) => {
    const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
    if (trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.Month),
            datasets: [{
                label: 'Permit Applications',
                data: data.map(d => d.PermitCount),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
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
                backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
};

const renderTypeChart = (data: any[]) => {
    const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
    if (typeChartInstance) typeChartInstance.destroy();

    typeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.category),
            datasets: [{
                label: 'Volume',
                data: data.map(d => d.count),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
};
