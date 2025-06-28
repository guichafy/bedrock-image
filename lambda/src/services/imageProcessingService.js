const { InvalidImageError } = require('../errors/customErrors');
const { decodeBase64 } = require('../utils/base64Decoder');
const { isValidPng, getFormatFromContentType } = require('../utils/imageValidator');
const logger = require('../utils/logger');

function parseBody(event) {
  const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || 'image/png';
  let imageBytes;

  if (!event.body) {
    throw new InvalidImageError('No image data received');
  }

  if (Buffer.isBuffer(event.body)) {
    imageBytes = event.body;
  } else if (event.isBase64Encoded) {
    imageBytes = decodeBase64(event.body);
  } else {
    imageBytes = Buffer.from(event.body, 'binary');
  }

  logger.debug('Image bytes length: ' + imageBytes.length);

  if (!isValidPng(imageBytes)) {
    throw new InvalidImageError('Invalid PNG file format');
  }

  const format = getFormatFromContentType(contentType);

  return { imageBytes, format };
}

module.exports = { parseBody };
