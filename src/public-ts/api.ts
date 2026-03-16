export const customFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let accessToken = localStorage.getItem('iris_access_token');
    
    // Add authorization header
    if (accessToken) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`
        };
    }

    let response = await fetch(url, options);

    // If unauthorized, try to refresh token
    if (response.status === 401 && !url.includes('/api/auth/login')) {
        const refreshToken = localStorage.getItem('iris_refresh_token');
        
        if (refreshToken) {
            const refreshRes = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                accessToken = data.accessToken;
                localStorage.setItem('iris_access_token', accessToken as string);

                // Retry original request with new token
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${accessToken}`
                };
                response = await fetch(url, options);
            } else {
                // Refresh token also failed/expired - logout
                logout();
            }
        } else {
            // No refresh token available - logout
            logout();
        }
    }

    return response;
};

export const fetchKPI = async (domain: string, period: string = 'all') => {
    const response = await customFetch(`/api/kpi/${domain}?period=${period}`);
    if (!response.ok) throw new Error(`Failed to fetch ${domain} KPI`);
    return response.json();
};

const logout = () => {
    localStorage.removeItem('iris_access_token');
    localStorage.removeItem('iris_refresh_token');
    localStorage.removeItem('iris_user');
    window.location.reload(); // Force re-auth
};
