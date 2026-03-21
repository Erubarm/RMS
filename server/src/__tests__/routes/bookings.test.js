const request = require('supertest');
const express = require('express');

jest.mock('../../prisma', () => ({
  timeSlot: { findUnique: jest.fn() },
  booking: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../utils/generateCode', () => ({
  generateBookingCode: jest.fn(() => 'RMI-TESTCODE'),
}));

const prisma = require('../../prisma');
const bookingsRouter = require('../../routes/bookings');

// Минимальное тестовое приложение с mock-авторизацией
function createApp(user = { id: 1, vkId: 1, role: 'USER' }) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.user = user; next(); });
  app.use('/api/bookings', bookingsRouter);
  return app;
}

// Вспомогательная функция: слот на 3 дня вперёд
function makeFutureSlot({ availableSpots = 10, bookedSpots = 0 } = {}) {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return {
    id: 1,
    date,
    time: '14:00',
    availableSpots,
    bookings: Array(bookedSpots).fill({ peopleCount: 1 }),
  };
}

// ─── POST /api/bookings ───────────────────────────────────────────────────────

describe('POST /api/bookings — создание бронирования', () => {
  test('успешно создаёт бронирование', async () => {
    const slot = makeFutureSlot({ availableSpots: 10, bookedSpots: 2 });
    prisma.timeSlot.findUnique.mockResolvedValue(slot);
    prisma.booking.create.mockResolvedValue({
      id: 1,
      code: 'RMI-TESTCODE',
      peopleCount: 2,
      status: 'PENDING',
      timeSlot: slot,
    });

    const res = await request(createApp())
      .post('/api/bookings')
      .send({ timeSlotId: 1, peopleCount: 2 });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe('RMI-TESTCODE');
    expect(prisma.booking.create).toHaveBeenCalled();
  });

  test('возвращает 400 если не переданы обязательные поля', async () => {
    const res = await request(createApp())
      .post('/api/bookings')
      .send({ timeSlotId: 1 }); // нет peopleCount

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(400);
  });

  test('возвращает 400 если peopleCount < 1', async () => {
    const res = await request(createApp())
      .post('/api/bookings')
      .send({ timeSlotId: 1, peopleCount: 0 });

    expect(res.status).toBe(400);
  });

  test('возвращает 404 если слот не найден', async () => {
    prisma.timeSlot.findUnique.mockResolvedValue(null);

    const res = await request(createApp())
      .post('/api/bookings')
      .send({ timeSlotId: 999, peopleCount: 1 });

    expect(res.status).toBe(404);
  });

  test('возвращает 400 если превышен лимит мест (проверка бизнес-правила)', async () => {
    const slot = makeFutureSlot({ availableSpots: 5, bookedSpots: 4 });
    prisma.timeSlot.findUnique.mockResolvedValue(slot);

    const res = await request(createApp())
      .post('/api/bookings')
      .send({ timeSlotId: 1, peopleCount: 3 }); // 4 занято + 3 = 7 > 5

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not enough available spots/i);
  });

  test('успешно создаёт бронирование на последние свободные места', async () => {
    const slot = makeFutureSlot({ availableSpots: 5, bookedSpots: 3 });
    prisma.timeSlot.findUnique.mockResolvedValue(slot);
    prisma.booking.create.mockResolvedValue({ id: 2, code: 'RMI-TESTCODE', peopleCount: 2 });

    const res = await request(createApp())
      .post('/api/bookings')
      .send({ timeSlotId: 1, peopleCount: 2 }); // ровно 2 свободных

    expect(res.status).toBe(201);
  });
});

// ─── GET /api/bookings/my ─────────────────────────────────────────────────────

describe('GET /api/bookings/my — список бронирований', () => {
  test('возвращает список бронирований текущего пользователя', async () => {
    const bookings = [
      { id: 1, code: 'RMI-AAA', peopleCount: 2, status: 'CONFIRMED' },
      { id: 2, code: 'RMI-BBB', peopleCount: 1, status: 'PENDING' },
    ];
    prisma.booking.findMany.mockResolvedValue(bookings);

    const res = await request(createApp()).get('/api/bookings/my');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } })
    );
  });

  test('возвращает пустой массив если бронирований нет', async () => {
    prisma.booking.findMany.mockResolvedValue([]);

    const res = await request(createApp()).get('/api/bookings/my');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─── DELETE /api/bookings/:id ─────────────────────────────────────────────────

describe('DELETE /api/bookings/:id — отмена бронирования', () => {
  function makeBookingWithDate(hoursFromNow) {
    const date = new Date();
    date.setHours(date.getHours() + hoursFromNow);
    const time = `${String(date.getUTCHours()).padStart(2, '0')}:00`;
    const slotDate = new Date(date);
    slotDate.setUTCHours(0, 0, 0, 0);
    return {
      id: 1,
      userId: 1,
      status: 'PENDING',
      timeSlot: { date: slotDate, time },
    };
  }

  test('успешно отменяет бронирование (> 24ч до слота)', async () => {
    const booking = makeBookingWithDate(48); // 48 часов вперёд
    prisma.booking.findUnique.mockResolvedValue(booking);
    prisma.booking.update.mockResolvedValue({ ...booking, status: 'CANCELLED' });

    const res = await request(createApp()).delete('/api/bookings/1');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CANCELLED');
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'CANCELLED' },
    });
  });

  test('возвращает 400 если осталось менее 24 часов до слота (бизнес-правило)', async () => {
    const booking = makeBookingWithDate(12); // только 12 часов
    prisma.booking.findUnique.mockResolvedValue(booking);

    const res = await request(createApp()).delete('/api/bookings/1');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/24 hours/i);
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  test('возвращает 404 если бронирование не найдено', async () => {
    prisma.booking.findUnique.mockResolvedValue(null);

    const res = await request(createApp()).delete('/api/bookings/999');

    expect(res.status).toBe(404);
  });

  test('возвращает 403 если бронирование принадлежит другому пользователю', async () => {
    const booking = { ...makeBookingWithDate(48), userId: 999 }; // чужое
    prisma.booking.findUnique.mockResolvedValue(booking);

    const res = await request(createApp({ id: 1 })).delete('/api/bookings/1');

    expect(res.status).toBe(403);
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });
});
