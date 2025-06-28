#!/bin/bash

# Script para testar a API da Lambda localmente usando base64

API_URL="http://localhost:3000/describe-image"
IMAGE_FILE="what-is-this.png"

echo "Testando a API Bedrock Image com base64..."

# Verifica se a imagem existe
if [ ! -f "$IMAGE_FILE" ]; then
    echo "Erro: Arquivo $IMAGE_FILE não encontrado."
    echo "Coloque uma imagem PNG ou JPG no diretório do projeto para testar."
    exit 1
fi

# Verifica se o servidor local está rodando
if ! curl -s "$API_URL" > /dev/null 2>&1; then
    echo "Erro: Servidor local não está rodando."
    echo "Execute primeiro: ./test-lambda.sh"
    exit 1
fi

echo "Convertendo imagem $IMAGE_FILE para base64..."
IMAGE_BASE64=$(base64 -i "$IMAGE_FILE")

echo "Criando arquivo JSON temporário..."
TEMP_JSON=$(mktemp)
cat > "$TEMP_JSON" << EOF
{
  "image": "$IMAGE_BASE64",
  "contentType": "image/png"
}
EOF

echo "Enviando imagem como base64 para $API_URL..."
echo ""

# Faz a requisição com dados em JSON
curl -X POST \
  -H "Content-Type: application/json" \
  -d @"$TEMP_JSON" \
  "$API_URL" | jq .

# Remove o arquivo temporário
rm "$TEMP_JSON"

echo ""
echo "Teste concluído!"