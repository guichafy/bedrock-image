const {
  isValidImageFormat,
  detectImageFormat,
  getFormatFromContentType
} = require('../../src/utils/imageValidator');

const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBApS85tsAAAAASUVORK5CYII=', 'base64');


test('isValidImageFormat detects PNG', () => {
  expect(isValidImageFormat(pngBuffer)).toBe(true);
});

test('detectImageFormat returns png', () => {
  expect(detectImageFormat(pngBuffer)).toBe('png');
});

test('getFormatFromContentType parses jpeg', () => {
  expect(getFormatFromContentType('image/jpeg')).toBe('jpeg');
});
