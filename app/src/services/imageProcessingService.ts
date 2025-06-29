import { APIGatewayProxyEvent } from 'aws-lambda';
import { isValidImageFormat, detectImageFormat, getFormatFromContentType } from '../utils/imageValidator';
import { InvalidImageError } from '../errors/customErrors';
import logger from '../utils/logger';
import { parse } from 'parse-multipart-data';

export function parseBody(event: APIGatewayProxyEvent): { imageBytes: Buffer; format: string } {
  logger.debug('=== DEBUG: Event Analysis ===');
  logger.debug('Event keys:', Object.keys(event));
  logger.debug('Body type:', typeof event.body);
  logger.debug('Body length:', event.body ? event.body.length : 0);
  logger.debug('isBase64Encoded:', (event as any).isBase64Encoded);

  const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || 'image/png';
  logger.debug('Content-Type:', contentType);

  let imageBytes: Buffer | undefined;
  const attempts: string[] = [];

  if (!event.body) {
    throw new InvalidImageError('No image data received');
  }

  if (typeof event.body === 'string') {
    logger.debug('First 20 chars of body:', event.body.substring(0, 20));
  }

  logger.debug('=== DEBUG: Processing Body ===');

  if (contentType.startsWith('multipart/form-data')) {
    try {
      const boundaryMatch = contentType.match(/boundary=(.*)/);
      if (!boundaryMatch) throw new Error('Boundary not found');
      const bodyBuffer = Buffer.from(event.body as string, (event as any).isBase64Encoded ? 'base64' : 'binary');
      const parts = parse(bodyBuffer, boundaryMatch[1]);
      const filePart = parts.find(p => p.filename);
      if (filePart) {
        imageBytes = Buffer.from(filePart.data);
      } else {
        attempts.push('multipart: file part not found');
      }
    } catch (e: any) {
      attempts.push('multipart: ' + e.message);
    }
  }

  if (contentType === 'application/json') {
    try {
      const jsonData = JSON.parse(event.body as string);
      logger.debug('JSON parsed successfully, keys:', Object.keys(jsonData));

      if (jsonData.image) {
        const base64Buffer = Buffer.from(jsonData.image, 'base64');
        logger.debug('JSON base64 attempt - length:', base64Buffer.length, 'first 4 bytes:', Array.from(base64Buffer.slice(0, 4)));
        if (base64Buffer.length > 0 && isValidImageFormat(base64Buffer)) {
          logger.debug('JSON base64 encoding successful - valid image format found');
          imageBytes = base64Buffer;
        } else {
          attempts.push('json-base64: no valid image format');
        }
      } else {
        attempts.push('json: no image field found');
      }
    } catch (e: any) {
      attempts.push('json: ' + e.message);
    }
  }

  if (!imageBytes && Buffer.isBuffer(event.body)) {
    logger.debug('Body is already a Buffer');
    imageBytes = event.body as unknown as Buffer;
  } else if (!imageBytes && (event as any).isBase64Encoded) {
    try {
      const base64Buffer = Buffer.from(event.body as string, 'base64');
      logger.debug('Direct base64 attempt - length:', base64Buffer.length, 'first 4 bytes:', Array.from(base64Buffer.slice(0, 4)));
      if (base64Buffer.length > 0 && isValidImageFormat(base64Buffer)) {
        logger.debug('Direct base64 encoding successful - valid image format found');
        imageBytes = base64Buffer;
      } else {
        attempts.push('direct-base64: no valid image format');
      }
    } catch (e: any) {
      attempts.push('direct-base64: ' + e.message);
    }
  } else if (!imageBytes && typeof event.body === 'string') {
    try {
      const binaryBuffer = Buffer.from(event.body, 'binary');
      logger.debug('Binary attempt - length:', binaryBuffer.length, 'first 4 bytes:', Array.from(binaryBuffer.slice(0, 4)));
      if (binaryBuffer.length > 0 && isValidImageFormat(binaryBuffer)) {
        logger.debug('Binary encoding successful - valid image format found');
        imageBytes = binaryBuffer;
      } else {
        attempts.push('binary: no valid image format');
      }
    } catch (e: any) {
      attempts.push('binary: ' + e.message);
    }
  }

  if (!imageBytes) {
    throw new InvalidImageError('Failed to process image data. Attempts: ' + attempts.join(', '));
  }

  logger.debug('=== DEBUG: Final Image Data ===');
  logger.debug('Image bytes length:', imageBytes.length);
  logger.debug('First 8 bytes:', Array.from(imageBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));

  if (!isValidImageFormat(imageBytes)) {
    throw new InvalidImageError('Invalid image file format. Got bytes: ' + Array.from(imageBytes.slice(0, 8)).map(b => '0x' + b.toString(16)).join(' '));
  }

  const format = detectImageFormat(imageBytes) || getFormatFromContentType(contentType);
  logger.debug('Detected format:', format);

  return { imageBytes, format };
}
