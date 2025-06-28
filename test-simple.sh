#!/bin/bash

echo "Testando Lambda com dados simples..."

# Teste 1: Enviar JSON simples
echo "Teste 1: JSON simples"
curl -X POST \
  http://localhost:3000/describe-image \
  -H "Content-Type: application/json" \
  -d '{"test": "hello"}'

echo -e "\n\nTeste 2: Texto simples"
curl -X POST \
  http://localhost:3000/describe-image \
  -H "Content-Type: text/plain" \
  -d "hello world"

echo -e "\n\nTeste concluído!"