const { generateBookingCode } = require('../../utils/generateCode');

describe('generateBookingCode', () => {
  test('генерирует код в формате RMI-XXXXXXXX', () => {
    const code = generateBookingCode();
    expect(code).toMatch(/^RMI-[0-9A-F]{8}$/);
  });

  test('каждый вызов возвращает уникальный код', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateBookingCode()));
    expect(codes.size).toBe(100);
  });

  test('код состоит из 12 символов (RMI- + 8 hex)', () => {
    const code = generateBookingCode();
    expect(code).toHaveLength(12);
  });
});
