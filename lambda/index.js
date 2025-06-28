const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

exports.handler = async (event) => {
  try {
    console.log('=== DEBUG: Event Analysis ===');
    console.log('Event keys:', Object.keys(event));
    console.log('Body type:', typeof event.body);
    console.log('Body length:', event.body ? event.body.length : 0);
    console.log('isBase64Encoded:', event.isBase64Encoded);
    console.log('Headers:', JSON.stringify(event.headers, null, 2));
    console.log('RequestContext:', JSON.stringify(event.requestContext, null, 2));
    
    if (event.body && typeof event.body === 'string') {
      console.log('First 20 chars of body:', event.body.substring(0, 20));
      console.log('Body char codes (first 10):', event.body.substring(0, 10).split('').map(c => c.charCodeAt(0)));
    }

    let imageBytes;
    
    if (!event.body) {
      throw new Error('No image data received');
    }
    
    console.log('=== DEBUG: Processing Body ===');
    
    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || 'image/png';
    console.log('Content-Type:', contentType);
    
    // Múltiplas tentativas para processar os dados
    const attempts = [];
    
    if (Buffer.isBuffer(event.body)) {
      console.log('Body is already a Buffer');
      imageBytes = event.body;
    } else if (typeof event.body === 'string') {
      console.log('Body is string, trying different approaches...');
      
      // Tentativa 1: JSON com base64 (para contornar problemas do SAM local)
      if (contentType === 'application/json') {
        try {
          const jsonData = JSON.parse(event.body);
          console.log('JSON parsed successfully, keys:', Object.keys(jsonData));
          
          if (jsonData.image) {
            const base64Buffer = Buffer.from(jsonData.image, 'base64');
            console.log('JSON base64 attempt - length:', base64Buffer.length, 'first 4 bytes:', Array.from(base64Buffer.slice(0, 4)));
            if (base64Buffer.length > 0 && base64Buffer[0] === 0x89) {
              console.log('JSON base64 encoding successful - PNG magic bytes found');
              imageBytes = base64Buffer;
            } else {
              attempts.push('json-base64: no PNG magic bytes');
            }
          } else {
            attempts.push('json: no image field found');
          }
        } catch (e) {
          attempts.push('json: ' + e.message);
        }
      }
      
      // Tentativa 2: binary encoding (para dados binários diretos)
      if (!imageBytes) {
        try {
          const binaryBuffer = Buffer.from(event.body, 'binary');
          console.log('Binary attempt - length:', binaryBuffer.length, 'first 4 bytes:', Array.from(binaryBuffer.slice(0, 4)));
          if (binaryBuffer.length > 0 && binaryBuffer[0] === 0x89) {
            console.log('Binary encoding successful - PNG magic bytes found');
            imageBytes = binaryBuffer;
          } else {
            attempts.push('binary: no PNG magic bytes');
          }
        } catch (e) {
          attempts.push('binary: ' + e.message);
        }
      }
      
      // Tentativa 3: base64 direto (se marcado como base64)
      if (!imageBytes && event.isBase64Encoded) {
        try {
          const base64Buffer = Buffer.from(event.body, 'base64');
          console.log('Direct base64 attempt - length:', base64Buffer.length, 'first 4 bytes:', Array.from(base64Buffer.slice(0, 4)));
          if (base64Buffer.length > 0 && base64Buffer[0] === 0x89) {
            console.log('Direct base64 encoding successful - PNG magic bytes found');
            imageBytes = base64Buffer;
          } else {
            attempts.push('direct-base64: no PNG magic bytes');
          }
        } catch (e) {
          attempts.push('direct-base64: ' + e.message);
        }
      }
    } else {
      throw new Error('Unsupported body type: ' + typeof event.body);
    }
    
    if (!imageBytes) {
      throw new Error('Failed to process image data. Attempts: ' + attempts.join(', '));
    }
    
    console.log('=== DEBUG: Final Image Data ===');
     console.log('Image bytes length:', imageBytes.length);
     console.log('First 8 bytes:', Array.from(imageBytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    
    // Verifica se é um PNG válido
    if (imageBytes.length < 8 || imageBytes[0] !== 0x89 || imageBytes[1] !== 0x50 || imageBytes[2] !== 0x4E || imageBytes[3] !== 0x47) {
      throw new Error('Invalid PNG file format. Got bytes: ' + Array.from(imageBytes.slice(0, 8)).map(b => '0x' + b.toString(16)).join(' '));
    }

    // Determina o formato da imagem baseado no Content-Type
    let format = 'png'; // default
    if (contentType.includes('image/')) {
      format = contentType.split('/')[1] || 'png';
    }
    // Para application/json, assumimos PNG já que estamos enviando dados de imagem PNG
    if (contentType === 'application/json') {
      format = 'png';
    }
    
    // Valida se o formato é suportado pelo Bedrock
    const supportedFormats = ['gif', 'jpeg', 'png', 'webp'];
    if (!supportedFormats.includes(format)) {
      format = 'png'; // fallback para PNG
    }

    const modelId = process.env.MODEL_ID || 'anthropic.claude-3-sonnet-2024-04-09-v1:0';

    const params = {
      modelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              image: {
                format,
                source: { bytes: imageBytes }
              }
            },
            { text: 'Descreva a imagem.' }
          ]
        }
      ],
      inferenceConfig: { maxTokens: 512 }
    };

    const command = new ConverseCommand(params);
    const response = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error('Invocation error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing image', error: err.message }),
    };
  }
};
