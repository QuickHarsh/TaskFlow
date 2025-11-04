import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const rows = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/read', auth, async (req, res) => {
  const { ids } = req.body;
  try {
    if (Array.isArray(ids) && ids.length) {
      await prisma.notification.updateMany({
        where: { id: { in: ids.map(Number) }, user_id: req.user.id },
        data: { read_at: new Date() },
      });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
