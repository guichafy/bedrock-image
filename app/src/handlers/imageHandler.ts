import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { parseBody } from '../services/imageProcessingService';
import { describeImage } from '../services/bedrockService';
import { InvalidImageError } from '../errors/customErrors';
import logger from '../utils/logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { imageBytes, format } = parseBody(event);
    const response = await describeImage(imageBytes, format);
    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (err) {
    logger.error('Invocation error:', err);
    const statusCode = err instanceof InvalidImageError ? 400 : 500;
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { statusCode, body: JSON.stringify({ message }) };
  }
};
