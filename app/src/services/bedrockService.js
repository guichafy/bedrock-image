const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DEFAULT_REGION, DEFAULT_MODEL } = require('../config/constants');
const logger = require('../utils/logger');

const client = new BedrockRuntimeClient({ region: DEFAULT_REGION });

async function describeImage(imageBytes, format) {
  const params = {
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

module.exports = { describeImage };
