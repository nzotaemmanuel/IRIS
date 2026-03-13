declare const io: any;
import { fetchDashboardKPIs } from './dashboard';

let socket: any = null;

export const initializeSocket = () => {
    // Only init if we have a token (user logged in)
    const token = localStorage.getItem('iris_token');
    if (!token) return;

    // Disconnect existing if any before reconnecting
    if (socket && socket.connected) {
        return;
    }

    socket = io({
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000
    });

    const statusIndicator = document.getElementById('socketStatus');
    const dot = statusIndicator?.querySelector('.dot');

    socket.on('connect', () => {
        console.log('Realtime connected');
        if (statusIndicator && dot) {
            dot.classList.remove('red');
            dot.classList.add('green');
            statusIndicator.title = 'Live Feed Connected';
        }
    });

    socket.on('disconnect', () => {
        console.log('Realtime disconnected');
        if (statusIndicator && dot) {
            dot.classList.remove('green');
            dot.classList.add('red');
            statusIndicator.title = 'Live Feed Disconnected';
        }
    });

    // Handle incoming permit events
    socket.on('activity', (data: any) => {
        updateTicker(data);
    });

    // Handle global KPI refresh triggers
    socket.on('refresh_kpi', () => {
        // Flash the KPI container slightly to show an update happened
        const kpiGrid = document.querySelector('.kpi-grid');
        if (kpiGrid) {
            kpiGrid.classList.add('pulse-update');
            setTimeout(() => kpiGrid.classList.remove('pulse-update'), 500);
        }
        
        fetchDashboardKPIs();
    });

    // Expose socket globally so main.js can disconnect it on logout
    (window as any).irisSocket = socket;
};

const updateTicker = (event: any) => {
    const list = document.getElementById('liveTickerList');
    if (!list) return;

    // Remove empty state message
    const emptyMsg = list.querySelector('.ticker-empty');
    if (emptyMsg) {
        list.removeChild(emptyMsg);
    }

    const li = document.createElement('li');
    
    // Add icon based on status
    let icon = '<i class="fa-solid fa-bell text-blue"></i>';
    if (event.type === 'permit:new') icon = '<i class="fa-solid fa-plus-circle text-green" style="color:#10b981;"></i>';
    if (event.type === 'permit:statusChanged') icon = '<i class="fa-solid fa-arrows-rotate text-orange" style="color:#f59e0b;"></i>';

    const timeString = new Date(event.timestamp).toLocaleTimeString();

    li.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center;">
            ${icon}
            <span>${event.message}</span>
        </div>
        <span class="ticker-time">${timeString}</span>
    `;

    // Add to top and remove oldest if > 15
    list.prepend(li);
    if (list.children.length > 15) {
        list.removeChild(list.lastChild as Node);
    }
};
