const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma');
const { requireRole } = require('../../middleware/auth');
const { adminAuthMiddleware } = require('../../middleware/adminAuth');

// ─── POST /auth — публичный эндпоинт, выдаёт JWT ─────────────────────────────

router.post('/auth', async (req, res, next) => {
  try {
    const { secret } = req.body;
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Invalid admin secret', code: 401 });
    }

    // Найти или создать dev-пользователя с ролью ADMIN
    let user = await prisma.user.findUnique({ where: { vkId: 1 } });
    if (!user) {
      user = await prisma.user.create({
        data: { vkId: 1, firstName: 'Admin', lastName: 'RMI', role: 'ADMIN' },
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, role: user.role, name: `${user.firstName} ${user.lastName}` });
  } catch (err) {
    next(err);
  }
});

// Все остальные маршруты требуют JWT
router.use(adminAuthMiddleware);
router.use(requireRole('ADMIN', 'MODERATOR'));

// ─── GET /stats — статистика для дашборда ────────────────────────────────────

router.get('/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalBookings,
      totalUsers,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      upcomingBookings,
      recentBookings,
      popularExcursions,
      teacherRequestsPending,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.user.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({
        where: { timeSlot: { date: { gte: now, lte: sevenDaysLater } }, status: { in: ['PENDING', 'CONFIRMED'] } },
      }),
      // Бронирования за последние 7 дней для графика
      prisma.booking.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Топ экскурсий по бронированиям
      prisma.booking.groupBy({
        by: ['timeSlotId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      prisma.teacherRequest.count({ where: { status: 'PENDING' } }),
    ]);

    // Группируем бронирования по дням
    const bookingsByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      bookingsByDay[key] = 0;
    }
    for (const b of recentBookings) {
      const key = b.createdAt.toISOString().split('T')[0];
      if (key in bookingsByDay) bookingsByDay[key]++;
    }

    // Загружаем данные о популярных экскурсиях
    const slotIds = popularExcursions.map((p) => p.timeSlotId);
    const slots = await prisma.timeSlot.findMany({
      where: { id: { in: slotIds } },
      include: { excursion: true },
    });
    const excursionCounts = {};
    for (const p of popularExcursions) {
      const slot = slots.find((s) => s.id === p.timeSlotId);
      if (slot?.excursion) {
        const title = slot.excursion.title;
        excursionCounts[title] = (excursionCounts[title] || 0) + p._count.id;
      }
    }

    res.json({
      totals: { bookings: totalBookings, users: totalUsers, upcomingBookings, teacherRequestsPending },
      bookingsByStatus: { pending: pendingBookings, confirmed: confirmedBookings, cancelled: cancelledBookings },
      bookingsByDay: Object.entries(bookingsByDay).map(([date, count]) => ({ date, count })),
      popularExcursions: Object.entries(excursionCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (err) {
    next(err);
  }
});

// ─── Bookings ────────────────────────────────────────────

router.get('/bookings', async (req, res, next) => {
  try {
    const { status, date, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));

    const where = {};
    if (status) where.status = status;
    if (date) where.timeSlot = { date: new Date(date + 'T00:00:00.000Z') };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, vkId: true, firstName: true, lastName: true } },
          timeSlot: { include: { excursion: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ data: bookings, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    next(err);
  }
});

router.patch('/bookings/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required', code: 400 });

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { timeSlot: { include: { excursion: true } }, user: { select: { id: true, vkId: true, firstName: true, lastName: true } } },
    });
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// ─── Teacher Requests ─────────────────────────────────────

router.get('/teacher-requests', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const requests = await prisma.teacherRequest.findMany({
      where,
      include: {
        user: { select: { id: true, vkId: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

router.patch('/teacher-requests/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required', code: 400 });

    const request = await prisma.teacherRequest.update({ where: { id }, data: { status } });
    res.json(request);
  } catch (err) {
    next(err);
  }
});

// ─── Expositions ──────────────────────────────────────────

router.post('/expositions', async (req, res, next) => {
  try {
    const { title, description, imageUrl, schedule } = req.body;
    if (!title || !description || !schedule) {
      return res.status(400).json({ error: 'title, description, and schedule are required', code: 400 });
    }
    const exposition = await prisma.exposition.create({ data: { title, description, imageUrl, schedule } });
    res.status(201).json(exposition);
  } catch (err) { next(err); }
});

router.put('/expositions/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, imageUrl, schedule, isActive } = req.body;
    const exposition = await prisma.exposition.update({ where: { id }, data: { title, description, imageUrl, schedule, isActive } });
    res.json(exposition);
  } catch (err) { next(err); }
});

// ─── Events ───────────────────────────────────────────────

router.get('/events', async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(events);
  } catch (err) { next(err); }
});

router.post('/events', async (req, res, next) => {
  try {
    const { title, content, imageUrl, eventDate, type } = req.body;
    if (!title || !content || !type) {
      return res.status(400).json({ error: 'title, content, and type are required', code: 400 });
    }
    const event = await prisma.event.create({
      data: { title, content, imageUrl, eventDate: eventDate ? new Date(eventDate) : null, type },
    });
    res.status(201).json(event);
  } catch (err) { next(err); }
});

router.put('/events/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, content, imageUrl, eventDate, type, isActive } = req.body;
    const event = await prisma.event.update({
      where: { id },
      data: { title, content, imageUrl, eventDate: eventDate ? new Date(eventDate) : undefined, type, isActive },
    });
    res.json(event);
  } catch (err) { next(err); }
});

router.delete('/events/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.event.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── FAQ ──────────────────────────────────────────────────

router.get('/faq', async (req, res, next) => {
  try {
    const faq = await prisma.faq.findMany({ orderBy: { order: 'asc' } });
    res.json(faq);
  } catch (err) { next(err); }
});

router.post('/faq', async (req, res, next) => {
  try {
    const { question, answer, order } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'question and answer are required', code: 400 });
    }
    const faq = await prisma.faq.create({ data: { question, answer, order: order || 0 } });
    res.status(201).json(faq);
  } catch (err) { next(err); }
});

router.put('/faq/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { question, answer, order, isActive } = req.body;
    const faq = await prisma.faq.update({ where: { id }, data: { question, answer, order, isActive } });
    res.json(faq);
  } catch (err) { next(err); }
});

router.delete('/faq/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.faq.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── Time Slots ───────────────────────────────────────────

router.post('/time-slots/generate', async (req, res, next) => {
  try {
    const { excursionId, startDate, endDate, times, availableSpots } = req.body;
    if (!excursionId || !startDate || !endDate || !times?.length || !availableSpots) {
      return res.status(400).json({ error: 'excursionId, startDate, endDate, times[], and availableSpots are required', code: 400 });
    }

    const excursion = await prisma.excursion.findUnique({ where: { id: excursionId } });
    if (!excursion) return res.status(404).json({ error: 'Excursion not found', code: 404 });

    const slotsData = [];
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T00:00:00.000Z');
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      for (const time of times) {
        slotsData.push({ excursionId, date: new Date(d), time, availableSpots });
      }
    }

    const result = await prisma.timeSlot.createMany({ data: slotsData });
    res.status(201).json({ created: result.count });
  } catch (err) { next(err); }
});

module.exports = router;
