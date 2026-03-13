import { customFetch } from './api.js';
declare const agGrid: any;

let gridApi: any = null;

export const initializeGrid = () => {
    if ((window as any).gridInitialized) return;
    (window as any).gridInitialized = true;

    const gridOptions = {
        columnDefs: [
            { field: 'PermitID', headerName: 'Permit ID', filter: 'agTextColumnFilter', width: 120 },
            { field: 'Applicant', filter: 'agTextColumnFilter', flex: 1 },
            { field: 'Category', filter: 'agSetColumnFilter', width: 150 },
            { field: 'LGA', filter: 'agSetColumnFilter', width: 150 },
            { 
                field: 'ApplicationDate', 
                headerName: 'Date', 
                filter: 'agDateColumnFilter',
                valueFormatter: (params: any) => new Date(params.value).toLocaleDateString()
            },
            { 
                field: 'Status', 
                filter: 'agSetColumnFilter', 
                width: 120,
                cellStyle: (params: any) => {
                    if (params.value === 'Approved') return { color: '#10b981', fontWeight: 'bold' };
                    if (params.value === 'Rejected') return { color: '#ef4444', fontWeight: 'bold' };
                    if (params.value === 'Pending') return { color: '#f59e0b', fontWeight: 'bold' };
                    return null;
                }
            },
            { field: 'AssignedOfficer', headerName: 'Officer', filter: 'agTextColumnFilter', flex: 1}
        ],
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true
        },
        pagination: true,
        paginationPageSize: 50,
        domLayout: 'normal'
    };

    const gridDiv = document.querySelector('#agGrid') as HTMLElement;
    gridApi = agGrid.createGrid(gridDiv, gridOptions);

    fetchGridData();

    // Export Handler
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (gridApi) {
                gridApi.exportDataAsCsv({ fileName: `iris-permits-${new Date().toISOString().split('T')[0]}.csv` });
            }
        });
    }

    // Search Handler
    const searchInput = document.getElementById('gridSearch') as HTMLInputElement;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            // Note: Normally we'd debounce and hit server with 'search' query param 
            // for true server-side pagination. For demo simplicity, we set it locally.
            if(gridApi) gridApi.setQuickFilter(searchInput.value);
        });
    }
};

const fetchGridData = async () => {
    gridApi.showLoadingOverlay();
    
    try {
        const res = await customFetch('/api/permits?page=1&limit=500');

        if (res.ok) {
            const result = await res.json();
            gridApi.setGridOption('rowData', result.data);
            gridApi.hideOverlay();
        } else {
             gridApi.showNoRowsOverlay();
        }
    } catch (err) {
        console.error("Failed to load grid data", err);
        gridApi.showNoRowsOverlay();
    }
};
