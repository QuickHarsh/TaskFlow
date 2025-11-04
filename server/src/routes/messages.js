import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/:projectId', auth, async (req, res) => {
  try {
    const rows = await prisma.message.findMany({
      where: { project_id: Number(req.params.projectId) },
      orderBy: { created_at: 'asc' },
      include: { sender: { select: { name: true } } },
    });
    const mapped = rows.map((m) => ({ ...m, sender_name: m.sender?.name || null }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
