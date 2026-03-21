const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Очистка перед сидированием (чтобы не было дубликатов)
  await prisma.booking.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.excursion.deleteMany();
  await prisma.exposition.deleteMany();
  await prisma.event.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.teacherRequest.deleteMany();
  console.log('Cleared existing data.');

  // Expositions — реальные залы парка "Россия — Моя история"
  const expositions = await Promise.all([
    prisma.exposition.create({
      data: {
        title: 'Рюриковичи',
        description:
          'Мультимедийная экспозиция об эпохе Рюриковичей — от призвания варягов до воцарения Романовых. Вы увидите ключевые события: Крещение Руси, монголо-татарское нашествие, объединение русских земель вокруг Москвы, эпоху Ивана Грозного.',
        schedule: 'СР–ВС 11:00–19:00',
        isActive: true,
      },
    }),
    prisma.exposition.create({
      data: {
        title: 'Романовы',
        description:
          'Интерактивная экспозиция о трёхсотлетнем правлении династии Романовых. Реформы Петра I, золотой век Екатерины II, Отечественная война 1812 года, отмена крепостного права и промышленный подъём Российской империи.',
        schedule: 'СР–ВС 11:00–19:00',
        isActive: true,
      },
    }),
    prisma.exposition.create({
      data: {
        title: 'От великих потрясений к Великой Победе (1914–1945)',
        description:
          'Экспозиция охватывает один из самых драматичных периодов отечественной истории: Первая мировая война, революция 1917 года, Гражданская война, индустриализация, Великая Отечественная война и Победа 1945 года.',
        schedule: 'СР–ВС 11:00–19:00',
        isActive: true,
      },
    }),
    prisma.exposition.create({
      data: {
        title: 'Россия — Моя история (1945 — наши дни)',
        description:
          'Послевоенное восстановление, космическая гонка, холодная война, перестройка, распад СССР и становление современной России. Мультимедийные инсталляции позволяют погрузиться в атмосферу каждой эпохи.',
        schedule: 'СР–ВС 11:00–19:00',
        isActive: true,
      },
    }),
  ]);

  // Excursions
  const excursions = await Promise.all([
    prisma.excursion.create({
      data: {
        expositionId: expositions[0].id,
        title: 'Обзорная экскурсия «Рюриковичи»',
        price: 400,
        maxGroupSize: 25,
        durationMin: 60,
      },
    }),
    prisma.excursion.create({
      data: {
        expositionId: expositions[0].id,
        title: 'Тематическая экскурсия «Крещение Руси»',
        price: 500,
        maxGroupSize: 20,
        durationMin: 45,
      },
    }),
    prisma.excursion.create({
      data: {
        expositionId: expositions[1].id,
        title: 'Обзорная экскурсия «Романовы»',
        price: 400,
        maxGroupSize: 25,
        durationMin: 60,
      },
    }),
    prisma.excursion.create({
      data: {
        expositionId: expositions[1].id,
        title: 'Тематическая экскурсия «Эпоха Петра I»',
        price: 500,
        maxGroupSize: 20,
        durationMin: 50,
      },
    }),
    prisma.excursion.create({
      data: {
        expositionId: expositions[2].id,
        title: 'Обзорная экскурсия «От великих потрясений к Великой Победе»',
        price: 400,
        maxGroupSize: 25,
        durationMin: 75,
      },
    }),
    prisma.excursion.create({
      data: {
        expositionId: expositions[3].id,
        title: 'Обзорная экскурсия «Россия — Моя история»',
        price: 400,
        maxGroupSize: 25,
        durationMin: 60,
      },
    }),
  ]);

  // Time slots — генерируем на ближайшие 2 недели (СР–ВС)
  const times = ['11:00', '13:00', '15:00', '17:00'];
  const today = new Date();
  const slots = [];

  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    // Skip Mon (1) and Tue (2) — park is closed
    if (dayOfWeek === 1 || dayOfWeek === 2) continue;

    for (const excursion of excursions) {
      for (const time of times) {
        slots.push({
          excursionId: excursion.id,
          date: new Date(date.toISOString().split('T')[0]),
          time,
          availableSpots: excursion.maxGroupSize,
        });
      }
    }
  }

  await prisma.timeSlot.createMany({ data: slots });
  console.log(`Created ${slots.length} time slots`);

  // Events
  await prisma.event.createMany({
    data: [
      {
        title: 'Ночь музеев 2026',
        content:
          'Приглашаем на ежегодную акцию «Ночь музеев»! Все экспозиции парка будут работать до 23:00. Специальная программа: квесты, мастер-классы, интерактивные лекции.',
        type: 'EXHIBITION',
        eventDate: new Date('2026-05-16'),
        isActive: true,
      },
      {
        title: 'Лекция «Загадки династии Рюриковичей»',
        content:
          'Историк Андрей Сахаров расскажет о малоизвестных фактах из истории первой русской династии. Вход свободный при наличии билета на экспозицию.',
        type: 'LECTURE',
        eventDate: new Date('2026-04-05'),
        isActive: true,
      },
      {
        title: 'Мастер-класс по каллиграфии',
        content:
          'Научитесь писать древнерусским уставом и полууставом. Все материалы предоставляются. Возраст: 10+. Необходима предварительная запись.',
        type: 'WORKSHOP',
        eventDate: new Date('2026-04-12'),
        isActive: true,
      },
      {
        title: 'Открытие обновлённой экспозиции «Романовы»',
        content:
          'После масштабной реконструкции зал «Романовы» открывается с новыми мультимедийными инсталляциями и интерактивными панелями.',
        type: 'NEWS',
        isActive: true,
      },
      {
        title: 'Олимпиада «Знатоки истории» для школьников',
        content:
          'Приглашаем школьников 7–11 классов на историческую олимпиаду. Победители получат бесплатные абонементы на все экспозиции парка.',
        type: 'EXHIBITION',
        eventDate: new Date('2026-04-20'),
        isActive: true,
      },
    ],
  });

  // FAQ
  await prisma.faq.createMany({
    data: [
      {
        question: 'Как добраться до парка?',
        answer:
          'Парк расположен по адресу: г. Тверь, ул. Советская, д. 34. Ближайшая остановка — «Площадь Ленина» (автобусы № 20, 21, 30, 41). От ж/д вокзала Тверь — 15 минут пешком.',
        order: 1,
      },
      {
        question: 'Какой график работы парка?',
        answer:
          'Парк работает со среды по воскресенье с 11:00 до 19:00 (касса до 18:00). Понедельник и вторник — выходные.',
        order: 2,
      },
      {
        question: 'Сколько стоят билеты?',
        answer:
          'Взрослый билет на одну экспозицию — 400 ₽, единый билет на все экспозиции — 900 ₽. Дети до 7 лет — бесплатно. Школьники, студенты, пенсионеры — скидка 50%.',
        order: 3,
      },
      {
        question: 'Можно ли отменить бронирование?',
        answer:
          'Да, бронирование можно отменить не позднее чем за 24 часа до начала экскурсии через раздел «Мои бронирования» в приложении.',
        order: 4,
      },
      {
        question: 'Есть ли скидки для групп?',
        answer:
          'Для организованных групп от 10 человек предусмотрена скидка 20%. Для оформления групповой заявки используйте раздел «Для учителей» или свяжитесь с нами по телефону.',
        order: 5,
      },
      {
        question: 'Доступен ли парк для маломобильных посетителей?',
        answer:
          'Да, все экспозиции парка полностью доступны для маломобильных посетителей. Есть пандусы, лифты и специальные зоны.',
        order: 6,
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
