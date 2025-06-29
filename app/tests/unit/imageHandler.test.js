const { InvalidImageError } = require('../../src/errors/customErrors');

jest.mock('../../src/services/imageProcessingService', () => ({
  parseBody: jest.fn()
}));

jest.mock('../../src/services/bedrockService', () => ({
  describeImage: jest.fn()
}));

jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn()
}));

const { handler } = require('../../src/handlers/imageHandler');
const { parseBody } = require('../../src/services/imageProcessingService');
const { describeImage } = require('../../src/services/bedrockService');
const logger = require('../../src/utils/logger');

describe('imageHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns description on success', async () => {
    parseBody.mockReturnValue({ imageBytes: Buffer.from('data'), format: 'png' });
    describeImage.mockResolvedValue({ description: 'ok' });
    const result = await handler({});
    expect(describeImage).toHaveBeenCalledWith(expect.any(Buffer), 'png');
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ description: 'ok' });
  });

  test('returns 400 for InvalidImageError', async () => {
    parseBody.mockImplementation(() => { throw new InvalidImageError('bad'); });
    const result = await handler({});
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('bad');
  });

  test('returns 500 for unexpected error', async () => {
    parseBody.mockReturnValue({ imageBytes: Buffer.from('a'), format: 'png' });
    describeImage.mockRejectedValue(new Error('fail'));
    const result = await handler({});
    expect(logger.error).toHaveBeenCalled();
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('fail');
  });
});
