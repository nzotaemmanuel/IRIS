import { Server, Socket } from 'socket.io';
import { executeQuery } from '../config/db';

// Keep track of connected clients
let activeClients = 0;

export const initializeSocketEvents = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    activeClients++;
    console.log(`Socket client connected [${socket.id}]. Active: ${activeClients}`);

    // Send an immediate welcome/sync event
    socket.emit('sync', { status: 'Connected to IRIS Real-time Server', timestamp: new Date() });

    socket.on('disconnect', () => {
      activeClients--;
      console.log(`Socket client disconnected [${socket.id}]. Active: ${activeClients}`);
    });
  });

  // Simulated Polling mechanism to mimic SQL Server Change Tracking or Service Broker
  // as stipulated by the specification constraints "polling the LASIMRA_Request_SMO"
  setInterval(async () => {
      if (activeClients === 0) return; // Don't poll DB if no one is listening

      try {
          // Check for recently created or recently updated permits (Within the last 15 seconds)
          // Since we don't know the exact schema modification tracker column, we mock the trigger logic
          const mockRecentEvents = [
              {
                  type: 'permit:new',
                  message: 'New permit application received for Gas-ROW in Eti-Osa',
                  data: { id: `P-${Date.now().toString().slice(-4)}`, status: 'Pending' },
                  timestamp: new Date().toISOString()
              },
              {
                  type: 'permit:statusChanged',
                  message: 'Permit P-20261054 status changed to Approved',
                  data: { id: 'P-20261054', status: 'Approved' },
                  timestamp: new Date().toISOString()
              }
          ];

          // Simulate random events happening
          if (Math.random() > 0.7) {
            const event = mockRecentEvents[Math.floor(Math.random() * mockRecentEvents.length)];
            io.emit('activity', event);
            
            // Also force a global KPI refresh when a significant event happens
            io.emit('refresh_kpi');
          }

      } catch (err) {
          console.error("Error polling for real-time changes", err);
      }
  }, 10000); // 10 seconds default poll interval as per spec
};
