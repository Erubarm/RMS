const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { sendBulkNotification } = require('../services/notificationService');
const { requireRole } = require('../middleware/auth');

// POST /subscribe — включить уведомления для текущего пользователя
router.post('/subscribe', async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { notifyEnabled: true },
      select: { id: true, notifyEnabled: true },
    });
    res.json({ success: true, notifyEnabled: user.notifyEnabled });
  } catch (err) {
    next(err);
  }
});

// DELETE /subscribe — отключить уведомления
router.delete('/subscribe', async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { notifyEnabled: false },
      select: { id: true, notifyEnabled: true },
    });
    res.json({ success: true, notifyEnabled: user.notifyEnabled });
  } catch (err) {
    next(err);
  }
});

// GET /status — получить статус подписки текущего пользователя
router.get('/status', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { notifyEnabled: true },
    });
    res.json({ notifyEnabled: user?.notifyEnabled ?? false });
  } catch (err) {
    next(err);
  }
});

// POST /broadcast — массовая рассылка (только ADMIN)
router.post('/broadcast', requireRole('ADMIN', 'MODERATOR'), async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'message is required', code: 400 });
    }

    const subscribers = await prisma.user.findMany({
      where: { notifyEnabled: true },
      select: { id: true, vkId: true },
    });

    if (subscribers.length === 0) {
      return res.json({ sent: 0, message: 'Нет подписчиков' });
    }

    // Запускаем рассылку асинхронно, сразу отвечаем клиенту
    res.json({ sent: subscribers.length, message: 'Рассылка запущена' });

    sendBulkNotification(subscribers, message).then((results) => {
      const failed = results.filter((r) => !r.ok).length;
      console.log(`[Broadcast] Отправлено: ${results.length - failed}, ошибок: ${failed}`);
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
