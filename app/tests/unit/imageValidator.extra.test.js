const {
  isValidPng,
  isValidImageFormat,
  detectImageFormat,
  getFormatFromContentType
} = require('../../src/utils/imageValidator');

describe('imageValidator additional cases', () => {
  test('isValidPng validates header', () => {
    const valid = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
    const invalid = Buffer.from([0x00,0x11,0x22,0x33]);
    expect(isValidPng(valid)).toBe(true);
    expect(isValidPng(invalid)).toBe(false);
  });

  test('isValidImageFormat detects jpeg gif webp and rejects others', () => {
    const jpeg = Buffer.from([0xFF,0xD8,0xFF,0xE0,0,0,0,0]);
    const gif = Buffer.from([0x47,0x49,0x46,0x38,0,0,0,0]);
    const webp = Buffer.from([0x52,0x49,0x46,0x46,0,0,0,0,0x57,0x45,0x42,0x50]);
    expect(isValidImageFormat(jpeg)).toBe(true);
    expect(isValidImageFormat(gif)).toBe(true);
    expect(isValidImageFormat(webp)).toBe(true);
    expect(isValidImageFormat(Buffer.from('bad'))).toBe(false);
  });

  test('detectImageFormat handles all formats and fallback', () => {
    const jpeg = Buffer.from([0xFF,0xD8,0xFF,0xE0]);
    const gif = Buffer.from([0x47,0x49,0x46,0x38]);
    const webp = Buffer.from([0x52,0x49,0x46,0x46,0,0,0,0,0x57,0x45,0x42,0x50]);
    expect(detectImageFormat(jpeg)).toBe('jpeg');
    expect(detectImageFormat(gif)).toBe('gif');
    expect(detectImageFormat(webp)).toBe('webp');
    expect(detectImageFormat(Buffer.from([0,0,0,0]))).toBe('png');
  });

  test('getFormatFromContentType returns appropriate or fallback', () => {
    expect(getFormatFromContentType('image/gif')).toBe('gif');
    expect(getFormatFromContentType('image/unknown')).toBe('png');
    expect(getFormatFromContentType(undefined)).toBe('png');
  });
});
