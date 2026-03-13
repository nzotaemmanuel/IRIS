import { fetchDashboardKPIs } from './dashboard.js';
import { renderCharts } from './charts.js';
import { initializeMap } from './maps.js';
import { initializeGrid } from './grid.js';
import { initializeSocket } from './realtime.js';
import { customFetch } from './api.js';

// App State
let accessToken = localStorage.getItem('iris_access_token') || null;
let currentUser = JSON.parse(localStorage.getItem('iris_user') || 'null');

// DOM Elements
const elements = {
    loginOverlay: document.getElementById('loginOverlay') as HTMLDivElement,
    appWrapper: document.getElementById('appWrapper') as HTMLDivElement,
    loginForm: document.getElementById('loginForm') as HTMLFormElement,
    loginError: document.getElementById('loginError') as HTMLDivElement,
    userNameDisplay: document.getElementById('userNameDisplay') as HTMLSpanElement,
    userRoleDisplay: document.getElementById('userRoleDisplay') as HTMLElement,
    logoutBtn: document.getElementById('logoutBtn') as HTMLButtonElement,
    navLinks: document.querySelectorAll('.nav-links li') as NodeListOf<HTMLLIElement>,
    viewSections: document.querySelectorAll('.view-section') as NodeListOf<HTMLDivElement>,
    viewTitle: document.getElementById('viewTitle') as HTMLHeadingElement,
    socketStatus: document.getElementById('socketStatus') as HTMLDivElement
};

// --- Authentication Logic ---
const checkAuth = () => {
    if (accessToken && currentUser) {
        // User is logged in
        elements.loginOverlay.classList.add('hidden');
        elements.appWrapper.classList.remove('hidden');
        
        elements.userNameDisplay.textContent = currentUser.name;
        elements.userRoleDisplay.textContent = currentUser.role;

        // Initialize application modules
        initializeDashboard();
        initializeSocket();
    } else {
        // User is logged out
        elements.loginOverlay.classList.remove('hidden');
        elements.appWrapper.classList.add('hidden');
    }
};

const handleLogin = async (e: Event) => {
    e.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    elements.loginError.textContent = 'Authenticating...';

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            accessToken = data.accessToken;
            const refreshToken = data.refreshToken;
            currentUser = data.user;
            
            localStorage.setItem('iris_access_token', accessToken as string);
            localStorage.setItem('iris_refresh_token', refreshToken as string);
            localStorage.setItem('iris_user', JSON.stringify(currentUser));
            
            elements.loginError.textContent = '';
            checkAuth();
        } else {
            elements.loginError.textContent = data.msg || 'Login failed';
        }
    } catch (err) {
        elements.loginError.textContent = 'Server connection error';
        console.error(err);
    }
};

const handleLogout = () => {
    accessToken = null;
    currentUser = null;
    localStorage.removeItem('iris_access_token');
    localStorage.removeItem('iris_refresh_token');
    localStorage.removeItem('iris_user');
    
    if ((window as any).irisSocket) {
        (window as any).irisSocket.disconnect();
    }
    
    checkAuth();
};

const switchView = (viewId: string) => {
    elements.navLinks.forEach(link => {
        if (link.dataset.view === viewId) {
            link.classList.add('active');
            elements.viewTitle.textContent = link.textContent?.trim() || 'Dashboard';
        } else {
            link.classList.remove('active');
        }
    });

    elements.viewSections.forEach(section => {
        if (section.id === `${viewId}View`) {
            section.classList.remove('hidden');
            section.classList.add('active');
        } else {
            section.classList.add('hidden');
            section.classList.remove('active');
        }
    });

    if (viewId === 'map') {
        initializeMap();
    }
    if (viewId === 'dataGrid') {
        initializeGrid();
    }
};

elements.loginForm.addEventListener('submit', handleLogin);
elements.logoutBtn.addEventListener('click', handleLogout);

elements.navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetView = link.dataset.view;
        if (targetView) switchView(targetView);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

const initializeDashboard = () => {
   fetchDashboardKPIs();
   renderCharts();
};
