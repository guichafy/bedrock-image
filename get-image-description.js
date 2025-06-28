require('dotenv').config();
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const fs = require('fs');
async function main() {
  const imagePath = process.argv[2];
  if (!imagePath) {
    console.error('Usage: node get-image-description.js <image-file>');
    process.exit(1);
  }

  const region = process.env.AWS_REGION || 'us-east-1';
  const client = new BedrockRuntimeClient({ region });

  const modelId = process.env.MODEL_ID || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0';

  const imageBytes = fs.readFileSync(imagePath);
  const base64Image = imageBytes.toString('base64');

  const params = {
    modelId,
    messages: [
      {
        role: 'user',
        content: [
          {
            image: {
              format: 'png',
              source: {
                bytes: imageBytes
              }
            }
          },
          {
            text: 'Descreva a imagem.'
          }
        ]
      }
    ],
    inferenceConfig: {
      maxTokens: 512
    }
  };

  const command = new ConverseCommand(params);

  try {
    const response = await client.send(command);
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Invocation error:', err);
  }
}

main();
