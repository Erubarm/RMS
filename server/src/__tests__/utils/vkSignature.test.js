const crypto = require('crypto');
const { verifyVKLaunchParams, extractVKUserId } = require('../../utils/vkSignature');

const SECRET = 'test_secret_key';

function buildLaunchParams(params, secret) {
  const sorted = Object.entries(params)
    .filter(([k]) => k.startsWith('vk_'))
    .sort(([a], [b]) => a.localeCompare(b));
  const query = new URLSearchParams(sorted).toString();
  const sign = crypto.createHmac('sha256', secret).update(query).digest('base64url');
  const all = new URLSearchParams({ ...params, sign });
  return all.toString();
}

describe('verifyVKLaunchParams', () => {
  const vkParams = {
    vk_user_id: '123456',
    vk_app_id: '54494236',
    vk_is_app_user: '1',
    vk_are_notifications_enabled: '0',
  };

  test('возвращает true для корректной подписи', () => {
    const query = buildLaunchParams(vkParams, SECRET);
    expect(verifyVKLaunchParams(query, SECRET)).toBe(true);
  });

  test('возвращает false при неверном ключе', () => {
    const query = buildLaunchParams(vkParams, SECRET);
    expect(verifyVKLaunchParams(query, 'wrong_key')).toBe(false);
  });

  test('возвращает false если отсутствует sign', () => {
    const query = new URLSearchParams(vkParams).toString();
    expect(verifyVKLaunchParams(query, SECRET)).toBe(false);
  });

  test('возвращает false если параметры изменены', () => {
    const query = buildLaunchParams(vkParams, SECRET);
    const tampered = query.replace('vk_user_id=123456', 'vk_user_id=999999');
    expect(verifyVKLaunchParams(tampered, SECRET)).toBe(false);
  });

  test('игнорирует не-vk_ параметры при вычислении подписи', () => {
    const paramsWithExtra = { ...vkParams, ref: 'catalog', utm_source: 'vk' };
    const query = buildLaunchParams(paramsWithExtra, SECRET);
    expect(verifyVKLaunchParams(query, SECRET)).toBe(true);
  });
});

describe('extractVKUserId', () => {
  test('извлекает vk_user_id из строки параметров', () => {
    const query = new URLSearchParams({ vk_user_id: '123456', vk_app_id: '1' }).toString();
    expect(extractVKUserId(query)).toBe(123456);
  });

  test('возвращает NaN если vk_user_id отсутствует', () => {
    const query = new URLSearchParams({ vk_app_id: '1' }).toString();
    expect(extractVKUserId(query)).toBeNaN();
  });
});
