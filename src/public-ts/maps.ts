import { customFetch } from './api.js';

declare const L: any;

let mapInstance: any = null;

export const initializeMap = async () => {
    // Determine if map is already initialized to avoid re-init error
    if ((window as any).mapInitialized) return;
    (window as any).mapInitialized = true;

    // Center on Lagos
    mapInstance = L.map('map').setView([6.5244, 3.3792], 11);

    // Standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Fetch and render point data
    try {
        const res = await customFetch('/api/geo/permits');
        
        if (res.ok) {
            const geoJsonData = await res.json();
            
            // Define custom marker colors based on category
            const getMarkerColor = (category: string) => {
                switch(category) {
                    case 'Fiber-ROW': return 'blue';
                    case 'Gas-ROW': return 'red';
                    case 'Power-ROW': return 'orange';
                    case 'Tower & Mast': return 'purple';
                    default: return 'gray';
                }
            };
            
            // Add GeoJSON layer to map
            L.geoJSON(geoJsonData, {
                pointToLayer: (feature: any, latlng: any) => {
                    const color = getMarkerColor(feature.properties.category);
                    return L.circleMarker(latlng, {
                        radius: 6,
                        fillColor: color,
                        color: '#fff',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                },
                onEachFeature: (feature: any, layer: any) => {
                    if (feature.properties) {
                        layer.bindPopup(`
                            <strong>ID:</strong> ${feature.properties.id}<br/>
                            <strong>Category:</strong> ${feature.properties.category}<br/>
                            <strong>Status:</strong> ${feature.properties.status || 'Active'}
                        `);
                    }
                }
            }).addTo(mapInstance);
        }
    } catch (err) {
        console.error("Failed to load map data", err);
    }
};
