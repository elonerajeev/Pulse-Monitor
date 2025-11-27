import { Server } from 'socket.io';
import http from 'http';

let io;

export const initWebSocket = (app) => {
    const server = http.createServer(app);
    io = new Server(server, {
        cors: {
            origin: ['https://pulse-monitor-frontend.onrender.com', 'http://localhost:5173', 'https://5173-firebase-server-1759253299248.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev'],
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected to WebSocket');
        socket.on('disconnect', () => {
            console.log('User disconnected from WebSocket');
        });
    });

    return server;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
