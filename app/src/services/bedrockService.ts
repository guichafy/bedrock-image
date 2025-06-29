import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { DEFAULT_REGION, DEFAULT_MODEL } from '../config/constants';
import logger from '../utils/logger';

const client = new BedrockRuntimeClient({ region: DEFAULT_REGION });

export async function describeImage(imageBytes: Buffer, format: string) {
  const params: any = {
    modelId: DEFAULT_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { image: { format, source: { bytes: imageBytes } } },
          { text: 'Descreva a imagem.' }
        ]
      }
    ],
    inferenceConfig: { maxTokens: 512 }
  };
  const command = new ConverseCommand(params);
  logger.debug('Sending request to Bedrock');
  return client.send(command);
}
