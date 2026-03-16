declare const Chart: any;

let instances: { [key: string]: any } = {};

const getChartTheme = () => ({
    color: '#94a3b8',
    font: { family: "'Inter', sans-serif", size: 11 },
    grid: { color: 'rgba(255, 255, 255, 0.05)' }
});

const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];

export const renderDomainChart = (domain: string, type: string, data: any[], containerId: string) => {
    const ctx = document.getElementById(containerId) as HTMLCanvasElement;
    if (!ctx) return;

    if (instances[containerId]) {
        instances[containerId].destroy();
    }

    const theme = getChartTheme();

    const config: any = {
        type: type,
        data: {
            labels: data.map(d => d.label || d.month || d.Outcome),
            datasets: [{
                data: data.map(d => d.value || d.count || d.Revenue),
                backgroundColor: type === 'doughnut' ? colors : colors[0],
                borderColor: colors[0],
                borderWidth: type === 'doughnut' ? 0 : 2,
                borderRadius: type === 'bar' ? 6 : 0,
                tension: 0.4,
                fill: type === 'line'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: type === 'doughnut',
                    position: 'bottom',
                    labels: { color: '#94a3b8', usePointStyle: true, font: { size: 11 } }
                }
            },
            scales: type === 'doughnut' ? {} : {
                y: { 
                    grid: theme.grid,
                    ticks: { color: theme.color, font: theme.font }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: theme.color, font: theme.font }
                }
            }
        }
    };

    if (type === 'line') {
        config.data.datasets[0].backgroundColor = 'rgba(99, 102, 241, 0.1)';
    }

    instances[containerId] = new Chart(ctx, config);
};
