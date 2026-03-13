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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Define port (iisnode uses process.env.PORT)
const PORT = process.env.PORT || 3000;

import authRoutes from './routes/auth';
import statsRoutes from './routes/stats';
import permitsRoutes from './routes/permits';
import geoRoutes from './routes/geo';
import { initializeSocketEvents } from './sockets/permitEvents';

// Route mount points
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/permits', permitsRoutes);
app.use('/api/geo', geoRoutes);

// Socket.io integration
initializeSocketEvents(io);

// Basic diagnostic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA-like behavior (if needed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
server.listen(PORT, () => {
  console.log(`IRIS Server is running on port ${PORT}`);
});

export { app, server, io };
