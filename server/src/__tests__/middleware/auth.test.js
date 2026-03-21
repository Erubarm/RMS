const crypto = require('crypto');

jest.mock('../../prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const prisma = require('../../prisma');
const { authMiddleware, requireRole } = require('../../middleware/auth');

const SECRET = 'test_secret';

function makeReq(launchParams) {
  return { headers: { 'x-vk-launch-params': launchParams } };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function buildValidLaunchParams(vkUserId = 42) {
  const params = { vk_user_id: String(vkUserId), vk_app_id: '1' };
  const sorted = Object.entries(params)
    .filter(([k]) => k.startsWith('vk_'))
    .sort(([a], [b]) => a.localeCompare(b));
  const query = new URLSearchParams(sorted).toString();
  const sign = crypto.createHmac('sha256', SECRET).update(query).digest('base64url');
  return new URLSearchParams({ ...params, sign }).toString();
}

beforeAll(() => {
  process.env.VK_SECURE_KEY = SECRET;
});

describe('authMiddleware', () => {
  test('возвращает 401 если заголовок x-vk-launch-params отсутствует', async () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('возвращает 403 при неверной подписи', async () => {
    const req = makeReq('vk_user_id=1&sign=bad_signature');
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('устанавливает req.user для существующего пользователя', async () => {
    const existingUser = { id: 1, vkId: 42, role: 'USER' };
    prisma.user.findUnique.mockResolvedValue(existingUser);

    const req = makeReq(buildValidLaunchParams(42));
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(req.user).toEqual(existingUser);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test('создаёт нового пользователя если не найден в БД', async () => {
    const newUser = { id: 2, vkId: 99, role: 'USER' };
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(newUser);

    const req = makeReq(buildValidLaunchParams(99));
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { vkId: 99, firstName: '', lastName: '' },
    });
    expect(req.user).toEqual(newUser);
    expect(next).toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  test('пропускает запрос если роль совпадает', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = makeRes();
    const next = jest.fn();

    requireRole('ADMIN', 'MODERATOR')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('возвращает 403 если роль не совпадает', () => {
    const req = { user: { role: 'USER' } };
    const res = makeRes();
    const next = jest.fn();

    requireRole('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('возвращает 403 если req.user отсутствует', () => {
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    requireRole('USER')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
