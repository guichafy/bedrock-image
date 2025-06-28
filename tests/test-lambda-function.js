require('dotenv').config();
const { handler } = require('./lambda/src/handlers/imageHandler');
const fs = require('fs');
const path = require('path');

// Simular evento da API Gateway com imagem PNG
async function testLambdaFunction() {
    try {
        // Ler a imagem de teste
        const imagePath = path.join(__dirname, 'what-is-this.png');
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        
        // Criar evento simulado da API Gateway
        const event = {
            httpMethod: 'POST',
            headers: {
                'content-type': 'image/png'
            },
            body: base64Image,
            isBase64Encoded: true
        };
        
        console.log('Testando função Lambda refatorada...');
        console.log('Formato detectado:', 'PNG');
        console.log('Tamanho da imagem:', imageBuffer.length, 'bytes');
        
        // Chamar o handler
        const result = await handler(event);
        
        console.log('\nResultado:');
        console.log('Status Code:', result.statusCode);
        
        if (result.statusCode === 200) {
            const response = JSON.parse(result.body);
            console.log('Descrição da imagem:', response.description);
            console.log('\n✅ Teste passou! A função Lambda refatorada está funcionando corretamente.');
        } else {
            console.log('Erro:', result.body);
            console.log('\n❌ Teste falhou.');
        }
        
    } catch (error) {
        console.error('\n❌ Erro durante o teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar o teste
testLambdaFunction();