import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { sendMail } from '../lib/email.js';

// Every day at 6:30 PM server time
cron.schedule('30 18 * * *', async () => {
  try {
    const projects = await prisma.project.findMany({ select: { id: true, name: true } });
    for (const p of projects) {
      const tasks = await prisma.task.findMany({ where: { project_id: p.id } });
      const done = tasks.filter(t => t.status === 'completed');
      const pending = tasks.filter(t => t.status !== 'completed');
      const blocked = tasks.filter(t => t.status === 'blocked');

      const members = await prisma.projectMember.findMany({
        where: { project_id: p.id },
        include: { user: { select: { email: true } } },
      });
      const to = members.map(m => m.user?.email).filter(Boolean);
      if (!to.length) continue;

      const html = `
        <h3>Daily Summary - ${p.name}</h3>
        <p><strong>Done:</strong> ${done.length}</p>
        <p><strong>Pending:</strong> ${pending.length}</p>
        <p><strong>Blocked:</strong> ${blocked.length}</p>
      `;
      await sendMail({ to: to.join(','), subject: `Daily Summary - ${p.name}`, html, text: html.replace(/<[^>]+>/g, '') });
    }
  } catch (e) {
    console.error('daily summary error', e.message);
  }
});
