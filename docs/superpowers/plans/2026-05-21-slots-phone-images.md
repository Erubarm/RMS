# Тестовые слоты, телефон в бронировании, картинки в афише — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить жёстко заданные тестовые слоты в seed, поле телефона в форму бронирования, и тематические изображения в афишу и события.

**Architecture:** Три независимых изменения: (1) seed.js — жёсткие даты слотов + imageUrl; (2) schema.prisma + bookings route — поле phone в Booking; (3) Booking.jsx — новый шаг 4 с телефоном; Events.jsx — отображение imageUrl.

**Tech Stack:** Node.js/Express/Prisma/PostgreSQL (backend), React/VKUI (frontend), Jest/Supertest (tests)

---

## Затронутые файлы

| Файл | Изменение |
|------|-----------|
| `server/prisma/schema.prisma` | Добавить `phone String` в модель `Booking` |
| `server/prisma/seed.js` | Фиксированные даты слотов (май–июнь 2026) + imageUrl для экспозиций и событий |
| `server/src/routes/bookings.js` | Принимать и сохранять `phone` из тела запроса |
| `server/src/__tests__/routes/bookings.test.js` | Добавить тест на обязательность `phone`, обновить существующие |
| `client/src/pages/Booking.jsx` | Новый шаг 4 с полем телефона, шаги 4→5 |
| `client/src/pages/Events.jsx` | Блок изображения в карточке события |

---

## Task 1: Добавить поле `phone` в схему Prisma и применить

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: Добавить поле `phone` в модель `Booking`**

Открыть `server/prisma/schema.prisma`. Найти модель `Booking` и добавить поле после `peopleCount`:

```prisma
model Booking {
  id          Int           @id @default(autoincrement())
  userId      Int
  user        User          @relation(fields: [userId], references: [id])
  timeSlotId  Int
  timeSlot    TimeSlot      @relation(fields: [timeSlotId], references: [id])
  peopleCount Int
  phone       String
  status      BookingStatus @default(PENDING)
  code        String        @unique
  createdAt   DateTime      @default(now())

  @@index([userId])
  @@index([timeSlotId])
  @@index([status])
}
```

- [ ] **Step 2: Применить изменение схемы к БД**

Убедиться, что Docker с PostgreSQL запущен (`docker ps`), затем:

```bash
cd server && npx prisma db push
```

Ожидаемый вывод:
```
Your database is now in sync with your Prisma schema.
```

- [ ] **Step 3: Убедиться, что Prisma Client обновился**

```bash
cd server && npx prisma generate
```

Ожидаемый вывод:
```
Generated Prisma Client
```

- [ ] **Step 4: Commit**

```bash
git add server/prisma/schema.prisma
git commit -m "feat: add phone field to Booking model"
```

---

## Task 2: Обновить маршрут бронирования — принимать и сохранять `phone`

**Files:**
- Modify: `server/src/routes/bookings.js`
- Modify: `server/src/__tests__/routes/bookings.test.js`

- [ ] **Step 1: Написать падающий тест — `phone` обязательный**

Открыть `server/src/__tests__/routes/bookings.test.js`. Найти блок `describe('POST /api/bookings — создание бронирования', ...)` и добавить тест после существующего теста на отсутствие `peopleCount`:

```js
test('возвращает 400 если не передан phone', async () => {
  const res = await request(createApp())
    .post('/api/bookings')
    .send({ timeSlotId: 1, peopleCount: 2 });

  expect(res.status).toBe(400);
  expect(res.body.error).toMatch(/phone/i);
});
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

```bash
cd server && npx jest --testPathPattern="bookings.test" --no-coverage 2>&1 | tail -20
```

Ожидаемый вывод: тест `возвращает 400 если не передан phone` — FAIL (сейчас маршрут возвращает 201, потому что `phone` не проверяется).

- [ ] **Step 3: Обновить маршрут `POST /` в `server/src/routes/bookings.js`**

Заменить строку:
```js
const { timeSlotId, peopleCount } = req.body;
```
На:
```js
const { timeSlotId, peopleCount, phone } = req.body;
```

Заменить блок валидации:
```js
if (!timeSlotId || !peopleCount) {
  return res.status(400).json({ error: 'timeSlotId and peopleCount are required', code: 400 });
}
```
На:
```js
if (!timeSlotId || !peopleCount) {
  return res.status(400).json({ error: 'timeSlotId and peopleCount are required', code: 400 });
}

if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
  return res.status(400).json({ error: 'phone is required', code: 400 });
}
```

Заменить в `prisma.booking.create`:
```js
data: {
  userId,
  timeSlotId,
  peopleCount,
  code,
},
```
На:
```js
data: {
  userId,
  timeSlotId,
  peopleCount,
  phone: phone.trim(),
  code,
},
```

- [ ] **Step 4: Обновить существующий тест «успешно создаёт бронирование» — добавить `phone` в запрос**

В том же тест-файле найти тест `'успешно создаёт бронирование'` и добавить `phone` в `.send(...)`:

```js
const res = await request(createApp())
  .post('/api/bookings')
  .send({ timeSlotId: 1, peopleCount: 2, phone: '+79001234567' });
```

- [ ] **Step 5: Запустить тесты — убедиться, что все проходят**

```bash
cd server && npx jest --testPathPattern="bookings.test" --no-coverage 2>&1 | tail -20
```

Ожидаемый вывод: все тесты — PASS.

- [ ] **Step 6: Запустить полный набор тестов**

```bash
cd server && npx jest --no-coverage 2>&1 | tail -10
```

Ожидаемый вывод: все тесты — PASS, 0 failed.

- [ ] **Step 7: Commit**

```bash
git add server/src/routes/bookings.js server/src/__tests__/routes/bookings.test.js
git commit -m "feat: accept and store phone in booking route"
```

---

## Task 3: Обновить seed — фиксированные даты слотов и imageUrl

**Files:**
- Modify: `server/prisma/seed.js`

- [ ] **Step 1: Заменить генерацию временных слотов на фиксированные даты**

Открыть `server/prisma/seed.js`. Найти блок `// Time slots — генерируем на ближайшие 2 недели (СР–ВС)` и заменить его полностью:

```js
// Time slots — фиксированные даты для демонстрации (22 мая — 30 июня 2026, СР–ВС)
const times = ['11:00', '13:00', '15:00', '17:00'];
const fixedDates = [];

const start = new Date('2026-05-22');
const end = new Date('2026-06-30');

for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  const dow = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (dow === 1 || dow === 2) continue; // закрыто пн и вт
  fixedDates.push(new Date(d));
}

const slots = [];
for (const date of fixedDates) {
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
```

- [ ] **Step 2: Добавить imageUrl в экспозиции**

В блоке `// Expositions` заменить все четыре `prisma.exposition.create(...)` — добавить `imageUrl` в каждый:

```js
const expositions = await Promise.all([
  prisma.exposition.create({
    data: {
      title: 'Рюриковичи',
      description: 'Мультимедийная экспозиция об эпохе Рюриковичей — от призвания варягов до воцарения Романовых. Вы увидите ключевые события: Крещение Руси, монголо-татарское нашествие, объединение русских земель вокруг Москвы, эпоху Ивана Грозного.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Vasnetsov_Invitation_of_the_Varangians.jpg/400px-Vasnetsov_Invitation_of_the_Varangians.jpg',
      schedule: 'СР–ВС 11:00–19:00',
      isActive: true,
    },
  }),
  prisma.exposition.create({
    data: {
      title: 'Романовы',
      description: 'Интерактивная экспозиция о трёхсотлетнем правлении династии Романовых. Реформы Петра I, золотой век Екатерины II, Отечественная война 1812 года, отмена крепостного права и промышленный подъём Российской империи.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Peter_the_Great_by_Kneller.jpg/400px-Peter_the_Great_by_Kneller.jpg',
      schedule: 'СР–ВС 11:00–19:00',
      isActive: true,
    },
  }),
  prisma.exposition.create({
    data: {
      title: 'От великих потрясений к Великой Победе (1914–1945)',
      description: 'Экспозиция охватывает один из самых драматичных периодов отечественной истории: Первая мировая война, революция 1917 года, Гражданская война, индустриализация, Великая Отечественная война и Победа 1945 года.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Raising_a_flag_over_the_Reichstag.jpg/400px-Raising_a_flag_over_the_Reichstag.jpg',
      schedule: 'СР–ВС 11:00–19:00',
      isActive: true,
    },
  }),
  prisma.exposition.create({
    data: {
      title: 'Россия — Моя история (1945 — наши дни)',
      description: 'Послевоенное восстановление, космическая гонка, холодная война, перестройка, распад СССР и становление современной России. Мультимедийные инсталляции позволяют погрузиться в атмосферу каждой эпохи.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Sputnik_asm.jpg/400px-Sputnik_asm.jpg',
      schedule: 'СР–ВС 11:00–19:00',
      isActive: true,
    },
  }),
]);
```

- [ ] **Step 3: Добавить imageUrl в события**

В блоке `// Events` заменить вызов `prisma.event.createMany(...)`:

```js
await prisma.event.createMany({
  data: [
    {
      title: 'Ночь музеев 2026',
      content: 'Приглашаем на ежегодную акцию «Ночь музеев»! Все экспозиции парка будут работать до 23:00. Специальная программа: квесты, мастер-классы, интерактивные лекции.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/National_Museum_Prague_2010b.jpg/400px-National_Museum_Prague_2010b.jpg',
      type: 'EXHIBITION',
      eventDate: new Date('2026-05-16'),
      isActive: true,
    },
    {
      title: 'Лекция «Загадки династии Рюриковичей»',
      content: 'Историк Андрей Сахаров расскажет о малоизвестных фактах из истории первой русской династии. Вход свободный при наличии билета на экспозицию.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Nestor_the_Chronicler.jpg/400px-Nestor_the_Chronicler.jpg',
      type: 'LECTURE',
      eventDate: new Date('2026-04-05'),
      isActive: true,
    },
    {
      title: 'Мастер-класс по каллиграфии',
      content: 'Научитесь писать древнерусским уставом и полууставом. Все материалы предоставляются. Возраст: 10+. Необходима предварительная запись.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Ostromir_Gospel_%281056-57%29.jpg/400px-Ostromir_Gospel_%281056-57%29.jpg',
      type: 'WORKSHOP',
      eventDate: new Date('2026-04-12'),
      isActive: true,
    },
    {
      title: 'Открытие обновлённой экспозиции «Романовы»',
      content: 'После масштабной реконструкции зал «Романовы» открывается с новыми мультимедийными инсталляциями и интерактивными панелями.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/RomanovFamily1913.jpg/400px-RomanovFamily1913.jpg',
      type: 'NEWS',
      isActive: true,
    },
    {
      title: 'Олимпиада «Знатоки истории» для школьников',
      content: 'Приглашаем школьников 7–11 классов на историческую олимпиаду. Победители получат бесплатные абонементы на все экспозиции парка.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Baptism_of_Vladimir.jpg/400px-Baptism_of_Vladimir.jpg',
      type: 'EXHIBITION',
      eventDate: new Date('2026-04-20'),
      isActive: true,
    },
  ],
});
```

- [ ] **Step 4: Запустить seed**

Убедиться, что Docker с PostgreSQL запущен, затем:

```bash
cd server && node prisma/seed.js
```

Ожидаемый вывод:
```
Seeding database...
Cleared existing data.
Created NNN time slots
Seed completed successfully!
```

Число слотов должно быть > 100 (6 экскурсий × 4 времени × ~N рабочих дней).

- [ ] **Step 5: Commit**

```bash
git add server/prisma/seed.js
git commit -m "feat: fixed demo slots (May–Jun 2026) and imageUrl for expositions/events"
```

---

## Task 4: Обновить форму бронирования — добавить шаг 4 «Телефон»

**Files:**
- Modify: `client/src/pages/Booking.jsx`

- [ ] **Step 1: Добавить состояние для телефона**

Открыть `client/src/pages/Booking.jsx`. В блоке `useState` после `const [peopleCount, setPeopleCount] = useState(1);` добавить:

```js
const [phone, setPhone] = useState('');
const [phoneError, setPhoneError] = useState('');
```

- [ ] **Step 2: Добавить функцию валидации телефона**

После объявления всех `useState` и перед `handleSubmit` добавить:

```js
const validatePhone = (value) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10;
};
```

- [ ] **Step 3: Обновить `handleSubmit` — передавать `phone`**

Найти строку `.post('/bookings', {` и добавить `phone` в тело запроса:

```js
const res = await client.post('/bookings', {
  excursionId: selectedExcursionId,
  date: selectedDate,
  slotId: selectedSlot?.id || selectedSlot?._id,
  time: selectedSlot?.time,
  people: peopleCount,
  phone,
});
```

- [ ] **Step 4: Обновить заголовки шагов 1–3 (с 1/4 на 1/5, 2/4 на 2/5, 3/4 на 3/5)**

Найти и заменить все три заголовка в `PanelHeader`:

- `Запись — Шаг 1/4` → `Запись — Шаг 1/5`
- `Запись — Шаг 2/4` → `Запись — Шаг 2/5`
- `Запись — Шаг 3/4` → `Запись — Шаг 3/5`

- [ ] **Step 5: Добавить новый шаг 4 «Телефон» перед шагом подтверждения**

Найти комментарий `// Step 4: Confirmation` и вставить перед ним новый блок:

```jsx
// Step 4: Phone number
if (step === 4) {
  return (
    <>
      <PanelHeader before={<PanelHeaderBack onClick={() => setStep(3)} />}>
        Запись — Шаг 4/5
      </PanelHeader>
      <Group header={<Header>Контактный телефон</Header>}>
        <FormItem
          top="Номер телефона"
          status={phoneError ? 'error' : undefined}
          bottom={phoneError || 'Для связи с вами по вопросам записи'}
        >
          <Input
            type="tel"
            placeholder="+7 (900) 000-00-00"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneError('');
            }}
          />
        </FormItem>
        <Box>
          <Button
            size="l"
            mode="primary"
            stretched
            onClick={() => {
              if (!validatePhone(phone)) {
                setPhoneError('Введите корректный номер телефона (минимум 10 цифр)');
                return;
              }
              setStep(5);
            }}
          >
            Далее
          </Button>
        </Box>
      </Group>
    </>
  );
}
```

- [ ] **Step 6: Обновить шаг подтверждения — был шаг 4, стал шаг 5**

Найти `// Step 4: Confirmation` и заменить на `// Step 5: Confirmation`.

Найти в этом блоке:
```jsx
if (step === 4) {
```
Заменить на:
```jsx
if (step === 5) {
```

Найти заголовок панели:
```jsx
Запись — Шаг 4/4
```
Заменить на:
```jsx
Запись — Шаг 5/5
```

Найти кнопку «Назад» на шаге подтверждения:
```jsx
<PanelHeaderBack onClick={() => setStep(3)} />
```
Заменить на:
```jsx
<PanelHeaderBack onClick={() => setStep(4)} />
```

Добавить строку с телефоном в блок сводки после `<Text><b>Количество человек:</b> {peopleCount}</Text>`:

```jsx
<Spacing size={4} />
<Text>
  <b>Телефон:</b> {phone}
</Text>
```

- [ ] **Step 7: Обновить шаг успеха — был шаг 5, стал шаг 6**

Найти `// Step 5: Success` и заменить на `// Step 6: Success`.

Найти:
```jsx
if (step === 5) {
```
Заменить на:
```jsx
if (step === 6) {
```

Найти в `handleSubmit` строку `setStep(5)` и заменить на `setStep(6)`.

- [ ] **Step 8: Проверить в браузере**

Запустить клиент:
```bash
cd client && npm run dev
```

Пройти полный цикл бронирования: выбор экскурсии → дата → время → **новый шаг с телефоном** → подтверждение с отображением телефона → успех. Убедиться, что при пустом поле или коротком номере показывается ошибка валидации.

- [ ] **Step 9: Commit**

```bash
git add client/src/pages/Booking.jsx
git commit -m "feat: add phone number step to booking form (step 4 of 5)"
```

---

## Task 5: Обновить Events.jsx — отображать изображения в карточках событий

**Files:**
- Modify: `client/src/pages/Events.jsx`

- [ ] **Step 1: Добавить импорт иконки**

Открыть `client/src/pages/Events.jsx`. Найти строку импорта иконок:
```js
import { Icon56CalendarOutline } from '@vkontakte/icons';
```
Заменить на:
```js
import { Icon56CalendarOutline, Icon56GalleryOutline } from '@vkontakte/icons';
```

- [ ] **Step 2: Добавить блок изображения в карточку события**

Найти в `Events.jsx` компонент `<Card key={...}>` и заменить его содержимое:

```jsx
{events.map((event, index) => (
  <Card key={event.id || event._id || index}>
    <div
      style={{
        height: 140,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
        />
      ) : (
        <Icon56GalleryOutline fill="#fff" />
      )}
    </div>
    <Box>
      <Title level="3">{event.title}</Title>
      <Spacing size={4} />
      <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
        {event.eventDate
          ? new Date(event.eventDate).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
            })
          : 'Дата уточняется'}
        {event.type && ` · ${event.type}`}
      </Text>
      <Spacing size={4} />
      <Text>{event.content}</Text>
    </Box>
  </Card>
))}
```

- [ ] **Step 3: Проверить в браузере**

Перейти на страницу «События» в запущенном клиенте. Убедиться, что карточки событий отображают изображения (или градиент-заглушку, если URL недоступен).

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/Events.jsx
git commit -m "feat: show event images in Events page"
```

---

## Финальная проверка

- [ ] Запустить все серверные тесты: `cd server && npx jest --no-coverage` — все PASS
- [ ] Пересидировать БД: `cd server && node prisma/seed.js` — слоты созданы
- [ ] Запустить клиент: `cd client && npm run dev` — нет ошибок в консоли
- [ ] Афиша: карточки экспозиций показывают исторические изображения
- [ ] События: карточки событий показывают изображения
- [ ] Бронирование: форма из 5 шагов, шаг 4 — ввод телефона с валидацией
- [ ] Бронирование: телефон отображается в сводке на шаге 5 и отправляется на сервер
