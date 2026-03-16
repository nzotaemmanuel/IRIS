import { handleRealtimeKPIUpdate, initializeKPIDashboard } from './kpi-loader.js';
declare const io: any;

let socket: any = null;

export const initializeSocket = () => {
    // Only init if we have a token (user logged in)
    const token = localStorage.getItem('iris_access_token');
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

    socket.on('kpi_update', (data: any) => {
        handleRealtimeKPIUpdate(data);
    });

    // Handle global KPI refresh triggers
    socket.on('refresh_kpi', () => {
        // Flash the KPI container slightly to show an update happened
        const kpiGrid = document.querySelector('.kpi-grid');
        if (kpiGrid) {
            kpiGrid.classList.add('pulse-update');
            setTimeout(() => kpiGrid.classList.remove('pulse-update'), 500);
        }
        
        initializeKPIDashboard();
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
    li.className = 'ticker-item';
    
    // Add icon based on status
    let iconColor = '#6366f1'; // Default indigo
    let iconClass = 'fa-bell';
    
    if (event.type === 'permit:new') {
        iconColor = '#10b981';
        iconClass = 'fa-circle-plus';
    } else if (event.type === 'permit:statusChanged') {
        iconColor = '#f59e0b';
        iconClass = 'fa-arrows-rotate';
    }

    const timeString = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    li.innerHTML = `
        <div class="ticker-content" style="display: flex; gap: 12px; align-items: center;">
            <i class="fa-solid ${iconClass}" style="color: ${iconColor}; font-size: 1rem;"></i>
            <span>${event.message}</span>
        </div>
        <span class="ticker-time">${timeString}</span>
    `;

    // Add to top and remove oldest if > 10
    list.prepend(li);
    if (list.children.length > 10) {
        list.removeChild(list.lastChild as Node);
    }
};
