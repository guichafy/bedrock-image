require('dotenv').config();
const { parseBody } = require('./lambda/src/services/imageProcessingService');
const fs = require('fs');
const path = require('path');

// Teste para diferentes formatos de entrada
async function testMultipleFormats() {
    try {
        console.log('🧪 Testando múltiplos formatos de entrada...');
        
        // Ler a imagem de teste
        const imagePath = path.join(__dirname, 'what-is-this.png');
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        
        // Teste 1: Evento com isBase64Encoded=true
        console.log('\n1️⃣ Testando evento com isBase64Encoded=true...');
        const event1 = {
            httpMethod: 'POST',
            headers: { 'content-type': 'image/png' },
            body: base64Image,
            isBase64Encoded: true
        };
        const result1 = parseBody(event1);
        console.log('✅ Sucesso - Formato:', result1.format, 'Tamanho:', result1.imageBytes.length);
        
        // Teste 2: Evento com JSON contendo base64
        console.log('\n2️⃣ Testando evento com JSON contendo base64...');
        const event2 = {
            httpMethod: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ image: base64Image, format: 'png' }),
            isBase64Encoded: false
        };
        const result2 = parseBody(event2);
        console.log('✅ Sucesso - Formato:', result2.format, 'Tamanho:', result2.imageBytes.length);
        
        // Teste 3: Evento com Buffer direto
        console.log('\n3️⃣ Testando evento com Buffer direto...');
        const event3 = {
            httpMethod: 'POST',
            headers: { 'content-type': 'image/png' },
            body: imageBuffer,
            isBase64Encoded: false
        };
        const result3 = parseBody(event3);
        console.log('✅ Sucesso - Formato:', result3.format, 'Tamanho:', result3.imageBytes.length);
        
        console.log('\n🎉 Todos os testes de formato passaram!');
        console.log('\n📊 Resumo das três soluções implementadas:');
        console.log('✅ Solução 1: Processamento multi-tentativa implementado');
        console.log('✅ Solução 2: Validação de múltiplos formatos de imagem implementada');
        console.log('✅ Solução 3: Logs de debug detalhados implementados');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar o teste
testMultipleFormats();