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

// Testes adicionais para melhorar cobertura
test('parseBody handles JSON without image field', () => {
  const event = {
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: 'some data' }),
    isBase64Encoded: false,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});

test('parseBody handles invalid JSON', () => {
  const event = {
    headers: { 'content-type': 'application/json' },
    body: 'invalid json{',
    isBase64Encoded: false,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});

test('parseBody handles JSON with invalid base64 image', () => {
  const event = {
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ image: 'invalid-base64-data' }),
    isBase64Encoded: false,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});

test('parseBody handles direct base64 with invalid image format', () => {
  const event = {
    headers: { 'content-type': 'image/png' },
    body: 'aW52YWxpZCBpbWFnZSBkYXRh', // "invalid image data" em base64
    isBase64Encoded: true,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});

test('parseBody handles direct base64 with error', () => {
  const event = {
    headers: { 'content-type': 'image/png' },
    body: 'invalid-base64!@#$%',
    isBase64Encoded: true,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});

test('parseBody handles binary string with invalid image format', () => {
  const event = {
    headers: { 'content-type': 'image/png' },
    body: 'invalid binary image data',
    isBase64Encoded: false,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});

test('parseBody handles binary string with error', () => {
  // Mock Buffer.from to throw an error
  const originalBufferFrom = Buffer.from;
  Buffer.from = jest.fn().mockImplementation((data, encoding) => {
    if (encoding === 'binary') {
      throw new Error('Binary encoding error');
    }
    return originalBufferFrom(data, encoding);
  });

  const event = {
    headers: { 'content-type': 'image/png' },
    body: 'some string data',
    isBase64Encoded: false,
  };
  
  expect(() => parseBody(event)).toThrow(InvalidImageError);
  
  // Restore original Buffer.from
  Buffer.from = originalBufferFrom;
});

test('parseBody handles valid binary string', () => {
  const event = {
    headers: { 'content-type': 'image/png' },
    body: pngBuffer.toString('binary'),
    isBase64Encoded: false,
  };
  const result = parseBody(event);
  expect(Buffer.isBuffer(result.imageBytes)).toBe(true);
  expect(result.format).toBe('png');
});

test('parseBody handles direct base64 decoding error', () => {
  // Test para cobrir linha 69 - catch do direct base64
  const event = {
    headers: { 'content-type': 'image/png' },
    body: 'invalid-base64-chars-!@#$%^&*()',
    isBase64Encoded: true,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});

test('parseBody throws error for invalid image format after processing', () => {
  // Test para cobrir linha 97 - validação final falha
  // Usar dados que passam na decodificação mas falham na validação de formato
  const invalidImageData = Buffer.from('This is not an image file').toString('base64');
  const event = {
    headers: { 'content-type': 'image/png' },
    body: invalidImageData,
    isBase64Encoded: true,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});

test('parseBody uses Content-Type header with capital C', () => {
  const event = {
    headers: { 'Content-Type': 'image/jpeg' },
    body: pngBase64,
    isBase64Encoded: true,
  };
  const result = parseBody(event);
  expect(Buffer.isBuffer(result.imageBytes)).toBe(true);
});

test('parseBody uses default content-type when headers are missing', () => {
  const event = {
    body: pngBase64,
    isBase64Encoded: true,
  };
  const result = parseBody(event);
  expect(Buffer.isBuffer(result.imageBytes)).toBe(true);
});

test('parseBody handles base64 decoding exception', () => {
  // Força um erro específico no Buffer.from para cobrir linha 69
  const event = {
    headers: { 'content-type': 'image/png' },
    body: '%invalid%base64%',
    isBase64Encoded: true,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});

test('parseBody handles empty body string', () => {
  const event = {
    headers: { 'content-type': 'image/png' },
    body: '',
    isBase64Encoded: false,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});

// new tests for multipart/form-data support
test('parseBody handles multipart file upload', () => {
  const boundary = '----testboundary';
  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="img.png"\r\n` +
    `Content-Type: image/png\r\n\r\n` +
    pngBuffer.toString('binary') +
    `\r\n--${boundary}--\r\n`;
  const event = {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    body: Buffer.from(multipartBody, 'binary').toString('base64'),
    isBase64Encoded: true,
  };
  const result = parseBody(event);
  expect(Buffer.isBuffer(result.imageBytes)).toBe(true);
  expect(result.format).toBe('png');
});

test('parseBody throws when multipart has no file', () => {
  const boundary = '----testboundary';
  const multipartBody = `--${boundary}--\r\n`;
  const event = {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    body: Buffer.from(multipartBody, 'binary').toString('base64'),
    isBase64Encoded: true,
  };
  expect(() => parseBody(event)).toThrow(InvalidImageError);
});
