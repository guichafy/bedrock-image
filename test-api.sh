#!/bin/bash

# Script para testar a API da Lambda localmente

API_URL="http://localhost:3000/describe-image"
IMAGE_FILE="what-is-this.png"

echo "Testando a API Bedrock Image..."

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

echo "Enviando imagem $IMAGE_FILE para $API_URL..."
echo ""

# Faz a requisição com dados binários
curl -X POST \
  -H "Content-Type: image/png" \
  --data-binary @"$IMAGE_FILE" \
  "$API_URL" | jq .

echo ""
echo "Teste concluído!"