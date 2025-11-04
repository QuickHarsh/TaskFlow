import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { auth, allowRoles } from '../middleware/auth.js';
import { getIO } from '../lib/socket.js';

const router = Router();

router.get('/', auth, async (req, res) => {
  const { projectId } = req.query;
  try {
    if (projectId) {
      const rows = await prisma.task.findMany({
        where: { project_id: Number(projectId) },
        orderBy: [
          { status: 'asc' },
          { priority: 'desc' },
          { due_date: 'asc' },
        ],
      });
      return res.json(rows);
    }
    const rows = await prisma.task.findMany({ where: { assignee_id: req.user.id }, orderBy: { updated_at: 'desc' } });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, projectId, assigneeId, priority = 'medium', status = 'todo', dueDate } = req.body;
  if (!title || !projectId) return res.status(400).json({ message: 'Missing fields' });
  try {
    const created = await prisma.task.create({
      data: {
        title,
        description: description || '',
        project_id: Number(projectId),
        assignee_id: assigneeId ? Number(assigneeId) : null,
        priority,
        status,
        due_date: dueDate ? new Date(dueDate) : null,
        created_by: req.user.id,
      },
    });
    // Notify assignee if present
    if (created.assignee_id) {
      const notif = await prisma.notification.create({
        data: {
          user_id: created.assignee_id,
          type: 'task_assigned',
          payload: { taskId: created.id, title: created.title },
        },
      });
      const io = getIO();
      if (io) io.to(`user:${created.assignee_id}`).emit('notification', notif);
    }
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', auth, async (req, res) => {
  const { title, description, assigneeId, priority, status, dueDate } = req.body;
  try {
    const updated = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: {
        title: title === undefined ? undefined : title,
        description: description === undefined ? undefined : description,
        assignee_id: assigneeId === undefined ? undefined : (assigneeId ? Number(assigneeId) : null),
        priority: priority === undefined ? undefined : priority,
        status: status === undefined ? undefined : status,
        due_date: dueDate === undefined ? undefined : (dueDate ? new Date(dueDate) : null),
      },
    });
    // Notify assignee on updates
    if (updated.assignee_id) {
      const notif = await prisma.notification.create({
        data: {
          user_id: updated.assignee_id,
          type: 'task_updated',
          payload: { taskId: updated.id, title: updated.title, status: updated.status },
        },
      });
      const io = getIO();
      if (io) io.to(`user:${updated.assignee_id}`).emit('notification', notif);
    }
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, allowRoles('admin'), async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
