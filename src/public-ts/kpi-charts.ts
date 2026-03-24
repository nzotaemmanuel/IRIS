declare const Chart: any;

let instances: { [key: string]: any } = {};

const getChartTheme = () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
        color: isLight ? '#475569' : '#94a3b8',
        font: { family: "'Inter', sans-serif", size: 11 },
        grid: { color: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)' }
    };
};

const colors = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#f97316'];

export const renderDomainChart = (domain: string, type: string, data: any[], containerId: string) => {
    const canvas = document.getElementById(containerId) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (instances[containerId]) {
        instances[containerId].destroy();
    }

    const theme = getChartTheme();
    const isCategoryChart = type === 'doughnut' || type === 'horizontalBar' || (type === 'bar' && domain === 'structures');
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    // Create Gradient for Line/Area charts
    let gradient = null;
    if (type === 'line' || type === 'bar' || type === 'horizontalBar') {
        gradient = ctx.createLinearGradient(0, 0, 0, 400);
        // Higher opacity for visibility
        const opacity = (type === 'bar' || type === 'horizontalBar') ? 0.7 : 0.2;
        gradient.addColorStop(0, isDark ? `rgba(99, 102, 241, ${opacity})` : `rgba(79, 70, 229, ${opacity})`);
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    }

    const config: any = {
        type: type === 'horizontalBar' ? 'bar' : type,
        data: {
            labels: data.map(d => d.label || d.month || d.Outcome),
            datasets: [{
                data: data.map(d => d.value || d.count || d.Revenue),
                backgroundColor: isCategoryChart ? colors : (gradient || colors[0]),
                borderColor: type === 'doughnut' ? 'transparent' : colors[0],
                borderWidth: type === 'line' ? 2 : 0,
                borderRadius: (type === 'bar' || type === 'horizontalBar') ? 8 : 0,
                tension: 0.4,
                fill: type === 'line',
                pointBackgroundColor: colors[0],
                pointRadius: type === 'line' ? 4 : 0,
                pointHoverRadius: 6,
                // Add hover states for extra pop
                hoverBackgroundColor: isDark ? 'rgba(99, 102, 241, 0.9)' : 'rgba(79, 70, 229, 0.9)',
                hoverBorderColor: isDark ? '#f8fafc' : '#ffffff',
                hoverBorderWidth: 2
            }]
        },
        options: {
            indexAxis: type === 'horizontalBar' ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: type === 'doughnut',
                    position: 'bottom',
                    labels: { 
                        color: theme.color, 
                        usePointStyle: true, 
                        pointStyle: 'circle',
                        font: { size: 12, weight: '500' },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: isDark ? '#f8fafc' : '#0f172a',
                    bodyColor: isDark ? '#94a3b8' : '#475569',
                    borderColor: 'rgba(99, 102, 241, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 8,
                    cornerRadius: 8,
                    usePointStyle: true
                }
            },
            scales: type === 'doughnut' ? {} : {
                y: { 
                    suggestedMax: 10,
                    grid: {
                        color: theme.grid.color,
                        drawBorder: false,
                    },
                    ticks: { 
                        color: theme.color, 
                        font: theme.font,
                        padding: 10
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: theme.color, 
                        font: theme.font,
                        padding: 10
                    }
                }
            }
        }
    };

    instances[containerId] = new Chart(ctx, config);
};
