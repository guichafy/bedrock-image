require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const fs = require('fs');
const { TextDecoder } = require('util');

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

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: base64Image
            }
          },
          {
            type: 'text',
            text: 'Descreva a imagem.'
          }
        ]
      }
    ],
    max_tokens: 512
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload)
  });

  try {
    const response = await client.send(command);
    const decoder = new TextDecoder('utf-8');
    const data = JSON.parse(decoder.decode(response.body));
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Invocation error:', err);
  }
}

main();
