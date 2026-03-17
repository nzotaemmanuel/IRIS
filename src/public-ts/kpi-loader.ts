import { fetchKPI } from './api.js';
import { renderDomainChart } from './kpi-charts.js';

export const initializeKPIDashboard = async () => {
    const domains = [
        'structures', 'customers', 'arrears', 'payments', 
        'requests', 'permits', 'surveillance', 'violations'
    ];

    for (const domain of domains) {
        try {
            const data = await fetchKPI(domain);
            updateKPIWidget(domain, data);
        } catch (err) {
            console.error(`Failed to load ${domain} KPI`, err);
        }
    }
};

const updateKPIWidget = (domain: string, data: any) => {
    // Update Total Value
    const totalEl = document.getElementById(`kpi-${domain}-total`);
    if (totalEl) {
        let value = data.total;
        if (domain === 'arrears' || domain === 'payments') {
            value = `₦${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            value = Number(value).toLocaleString();
        }
        totalEl.textContent = value;
    }

    // Render Associated Chart if exists
    switch (domain) {
        case 'structures':
            renderDomainChart(domain, 'doughnut', data.distribution, 'chart-structures');
            break;
        case 'payments':
            renderDomainChart(domain, 'bar', data.byChannel, 'chart-payments');
            break;
        case 'requests':
            renderDomainChart(domain, 'horizontalBar', data.pipeline, 'chart-requests');
            break;
        case 'violations':
            renderDomainChart(domain, 'bar', data.byType, 'chart-violations');
            break;
    }
};

// Real-time update handler
export const handleRealtimeKPIUpdate = (update: { domain: string, metric: string, value: any }) => {
    const totalEl = document.getElementById(`kpi-${update.domain}-total`);
    if (totalEl) {
        let value = update.value;
        if (update.domain === 'arrears' || update.domain === 'payments') {
            value = `₦${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            value = Number(value).toLocaleString();
        }
        
        // Brief pulse effect
        totalEl.textContent = value;
        totalEl.classList.add('pulse-update');
        setTimeout(() => totalEl.classList.remove('pulse-update'), 1000);
    }
};
