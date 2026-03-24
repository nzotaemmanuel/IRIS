import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route mount points
const authRoutes = require('./routes/auth').default || require('./routes/auth');
const statsRoutes = require('./routes/stats').default || require('./routes/stats');
const permitsRoutes = require('./routes/permits').default || require('./routes/permits');
const geoRoutes = require('./routes/geo').default || require('./routes/geo');
const kpiRoutes = require('./routes/kpi').default || require('./routes/kpi');
const structuresRoutes = require('./routes/structures').default || require('./routes/structures');
const paymentsRoutes = require('./routes/payments').default || require('./routes/payments');

console.log('⚡ IRIS: Mounting API Routes...');
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/permits', permitsRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/structures', structuresRoutes);
app.use('/api/payments', paymentsRoutes);

// Serve static files from the 'public' directory
const publicPath = path.resolve(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Define port (iisnode uses process.env.PORT)
const PORT = process.env.PORT || 3000;

import { initializeSocketEvents } from './sockets/permitEvents';

// Socket.io integration

// Socket.io integration
initializeSocketEvents(io);

// Basic diagnostic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA-like behavior
// Using app.use as a catch-all instead of app.get('*') to avoid Express 5 wildcard conflicts
app.use((req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start the server
server.listen(PORT, () => {
    console.log(`IRIS Server is running on port ${PORT}`);
});

export { app, server, io };
