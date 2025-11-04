import prisma from './prisma.js';

let ioRef = null;
export function setIO(io) { ioRef = io; }
export function getIO() { return ioRef; }

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('registerUser', (userId) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
    });

    socket.on('joinProject', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('message', async ({ projectId, senderId, content }) => {
      if (!projectId || !senderId || !content) return;
      try {
        const created = await prisma.message.create({
          data: { project_id: Number(projectId), sender_id: Number(senderId), content },
          include: { sender: { select: { name: true } } },
        });
        const message = { ...created, sender_name: created.sender?.name || null };
        io.to(`project:${projectId}`).emit('message', message);
      } catch (e) {
        console.error('message save error', e.message);
      }
    });
  });
}
