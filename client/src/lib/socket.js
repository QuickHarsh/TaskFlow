import { io } from 'socket.io-client';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

// Socket.io doesn't work on Vercel Serverless. 
// We disable autoConnect to prevent connection error spam in production.
// You can enable it locally if needed, or if you switch to a VPS.
const isVercel = API_URL.includes('vercel.app');

export const socket = io(API_URL, {
    autoConnect: !isVercel,
});
