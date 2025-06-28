const { decodeBase64 } = require('../../src/utils/base64Decoder');

const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBApS85tsAAAAASUVORK5CYII=';

test('decodeBase64 returns Buffer with expected length', () => {
  const buffer = decodeBase64(pngBase64);
  expect(Buffer.isBuffer(buffer)).toBe(true);
  expect(buffer.length).toBeGreaterThan(0);
});
