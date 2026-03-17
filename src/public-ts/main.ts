import { initializeSocket } from './realtime.js';
import { initializeKPIDashboard } from './kpi-loader.js';
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
    avatarInitials: document.getElementById('avatarInitials') as HTMLDivElement,
    logoutBtn: document.getElementById('logoutBtn') as HTMLButtonElement,
    navLinks: document.querySelectorAll('.nav-item') as NodeListOf<HTMLLIElement>,
    viewSections: document.querySelectorAll('.view-section') as NodeListOf<HTMLDivElement>,
    viewTitle: document.getElementById('viewTitle') as HTMLHeadingElement,
    socketStatus: document.getElementById('socketStatus') as HTMLDivElement,
    themeToggle: document.getElementById('themeToggle') as HTMLButtonElement
};

// --- Authentication Logic ---
const checkAuth = () => {
    if (accessToken && currentUser) {
        // User is logged in
        elements.loginOverlay.classList.add('hidden');
        elements.appWrapper.classList.remove('hidden');
        
        elements.userNameDisplay.textContent = currentUser.name;
        elements.userRoleDisplay.textContent = currentUser.role === 'ADMIN' ? 'System Administrator' : currentUser.role;
        
        // Set avatar initials
        const names = currentUser.name.split(' ');
        const initials = names.map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
        elements.avatarInitials.textContent = initials;

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
};

elements.loginForm.addEventListener('submit', handleLogin);
elements.logoutBtn.addEventListener('click', handleLogout);

// --- Theme Toggle ---
const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('iris_theme', newTheme);
    
    // Re-render charts to update their themes
    initializeKPIDashboard();
};

elements.themeToggle?.addEventListener('click', toggleTheme);

// --- Sidebar Toggle ---
const sidebarToggle = document.getElementById('sidebarToggle') as HTMLButtonElement;
const sidebar = document.querySelector('.sidebar') as HTMLElement;

sidebarToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

elements.navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetView = link.dataset.view;
        if (targetView) switchView(targetView);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('iris_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    checkAuth();
});

const initializeDashboard = () => {
   initializeKPIDashboard();
   // Legacy charts and dashboard calls removed or replaced by KPI loader
};
