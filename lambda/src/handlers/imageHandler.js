const logger = require('../utils/logger');
const { parseBody } = require('../services/imageProcessingService');
const { describeImage } = require('../services/bedrockService');
const { InvalidImageError } = require('../errors/customErrors');

exports.handler = async (event) => {
  try {
    const { imageBytes, format } = parseBody(event);
    const response = await describeImage(imageBytes, format);
    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (err) {
    logger.error('Invocation error:', err);
    const statusCode = err instanceof InvalidImageError ? 400 : 500;
    return { statusCode, body: JSON.stringify({ message: err.message }) };
  }
};
