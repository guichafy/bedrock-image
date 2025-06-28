const { parseBody } = require('../../src/services/imageProcessingService');
const { InvalidImageError } = require('../../src/errors/customErrors');

const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBApS85tsAAAAASUVORK5CYII=';
const pngBuffer = Buffer.from(pngBase64, 'base64');

test('parseBody handles base64 encoded event', () => {
  const event = {
    headers: { 'content-type': 'image/png' },
    body: pngBase64,
    isBase64Encoded: true,
  };
  const result = parseBody(event);
  expect(Buffer.isBuffer(result.imageBytes)).toBe(true);
  expect(result.format).toBe('png');
});

test('parseBody handles Buffer body', () => {
  const event = {
    headers: { 'content-type': 'image/png' },
    body: pngBuffer,
    isBase64Encoded: false,
  };
  const result = parseBody(event);
  expect(Buffer.isBuffer(result.imageBytes)).toBe(true);
  expect(result.format).toBe('png');
});

test('parseBody handles json with base64', () => {
  const event = {
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ image: pngBase64 }),
    isBase64Encoded: false,
  };
  const result = parseBody(event);
  expect(Buffer.isBuffer(result.imageBytes)).toBe(true);
  expect(result.format).toBe('png');
});

test('parseBody throws InvalidImageError for missing body', () => {
  expect(() => parseBody({ headers: {}, body: null })).toThrow(InvalidImageError);
});
