import http from 'http';

http.get('http://localhost:4000/api/kpi/structures', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('API Response:', data));
}).on('error', err => console.error('API Error:', err.message));
