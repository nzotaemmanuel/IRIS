import { customFetch } from './api.js';

let isInitialized = false;

/**
 * Initialize the Structures Loader
 */
export const initializeStructuresLoader = async () => {
    if (isInitialized) return;
    
    console.log('📡 Initializing Structures Loader...');
    await loadStructures();
    
    // Add listener for search
    const searchInput = document.getElementById('structures-search') as HTMLInputElement;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = (e.target as HTMLInputElement).value.toLowerCase();
            filterStructures(term);
        });
    }
    
    isInitialized = true;
};

/**
 * Fetch and render structures
 */
const loadStructures = async () => {
    const listContainer = document.getElementById('structures-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Loading structures...</td></tr>';
    
    try {
        const response = await customFetch('/api/structures?limit=50');
        const { data } = await response.json();
        
        if (!data || data.length === 0) {
            listContainer.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No structures found.</td></tr>';
            return;
        }
        
        renderStructures(data);
    } catch (err) {
        console.error('Failed to load structures:', err);
        listContainer.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--danger); padding: 2rem;">Error loading data.</td></tr>';
    }
};

/**
 * Render structures table rows
 */
const renderStructures = (structures: any[]) => {
    const listContainer = document.getElementById('structures-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = structures.map(s => `
        <tr data-site-id="${s.SiteID}">
            <td><span style="font-weight: 700; color: var(--accent-cyan); font-family: 'Outfit';">${s.SiteID || 'N/A'}</span></td>
            <td><div style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${s.Address}">${s.Address || 'No Address'}</div></td>
            <td>${s.LGA || 'N/A'}</td>
            <td><span class="status-badge" style="background: rgba(99, 102, 241, 0.1); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.2);">${s.Category || 'Unknown'}</span></td>
            <td>${s.Type || 'N/A'}</td>
            <td class="action-btns">
                <button class="action-btn" title="View Details"><i data-lucide="eye"></i></button>
                <button class="action-btn" title="View on Map"><i data-lucide="map-pin"></i></button>
            </td>
        </tr>
    `).join('');
    
    // Refresh icons
    if ((window as any).lucide) {
        (window as any).lucide.createIcons();
    }
};

/**
 * Simple client-side filter
 */
const filterStructures = (term: string) => {
    const rows = document.querySelectorAll('#structures-list tr');
    rows.forEach(row => {
        const text = (row as HTMLElement).innerText.toLowerCase();
        (row as HTMLElement).style.display = text.includes(term) ? '' : 'none';
    });
};
