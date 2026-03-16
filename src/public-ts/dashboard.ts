import { customFetch } from './api.js';

export const fetchDashboardKPIs = async () => {
    try {
        const res = await customFetch('/api/stats/kpis');
        
        if (res.ok) {
            const data = await res.json();
            document.getElementById('kpiTotal')!.textContent = `₦${data.TotalPermits.toLocaleString()}`;
            document.getElementById('kpiPending')!.textContent = data.PendingApplications.toLocaleString();
            document.getElementById('kpiApproved')!.textContent = data.ApprovedPermits.toLocaleString();
            document.getElementById('kpiInspections')!.textContent = data.ActiveInspections.toLocaleString();
        }
    } catch (err) {
        console.error('Failed to fetch KPIs', err);
    }
};
