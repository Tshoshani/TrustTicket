// socketService.js - single shared Socket.IO client for the React app.
//
// The backend exposes Socket.IO on the same origin as the REST API (port 3000).
// We keep ONE connection for the whole app and let components subscribe to the
// events they care about.
import { io } from 'socket.io-client';

// Socket.IO host. In production the frontend is served by the same Express
// server, so we connect to the SAME origin (pass undefined -> socket.io uses
// window.location). In local dev the backend is on a different port, so
// .env.development sets REACT_APP_SOCKET_URL=http://localhost:3000.
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || undefined;

// autoConnect is left on; the LiveUpdates page can also call connect()/disconnect()
// explicitly. A single instance is reused across the app.
const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

export default socket;
