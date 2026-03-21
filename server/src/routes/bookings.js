const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { generateBookingCode } = require('../utils/generateCode');

// POST / — create booking
router.post('/', async (req, res, next) => {
  try {
    const { timeSlotId, peopleCount } = req.body;
    const userId = req.user.id;

    if (!timeSlotId || !peopleCount) {
      return res.status(400).json({ error: 'timeSlotId and peopleCount are required', code: 400 });
    }

    if (peopleCount < 1) {
      return res.status(400).json({ error: 'peopleCount must be at least 1', code: 400 });
    }

    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: {
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          select: { peopleCount: true },
        },
      },
    });

    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found', code: 404 });
    }

    const bookedSpots = timeSlot.bookings.reduce((sum, b) => sum + b.peopleCount, 0);
    const freeSpots = timeSlot.availableSpots - bookedSpots;

    if (peopleCount > freeSpots) {
      return res.status(400).json({
        error: `Not enough available spots. Available: ${freeSpots}`,
        code: 400,
      });
    }

    const code = generateBookingCode();

    const booking = await prisma.booking.create({
      data: {
        userId,
        timeSlotId,
        peopleCount,
        code,
      },
      include: {
        timeSlot: {
          include: { excursion: true },
        },
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// GET /my — list current user's bookings
router.get('/my', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        timeSlot: {
          include: { excursion: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id — cancel booking
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        timeSlot: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found', code: 404 });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'You can only cancel your own bookings', code: 403 });
    }

    // Check that the slot is 24h+ in the future
    const slotDateTime = new Date(booking.timeSlot.date);
    const [hours, minutes] = booking.timeSlot.time.split(':').map(Number);
    slotDateTime.setUTCHours(hours, minutes, 0, 0);

    const now = new Date();
    const hoursUntilSlot = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSlot < 24) {
      return res.status(400).json({
        error: 'Cannot cancel booking less than 24 hours before the time slot',
        code: 400,
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json(updatedBooking);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
