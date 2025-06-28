#!/bin/bash

# Script para testar a Lambda localmente com SAM

echo "Testando a Lambda Bedrock Image localmente..."

# Verifica se o SAM CLI está instalado
if ! command -v sam &> /dev/null; then
    echo "Erro: SAM CLI não está instalado. Instale com: brew install aws-sam-cli"
    exit 1
fi

# Verifica se existe uma imagem para teste
if [ ! -f "what-is-this.png" ]; then
    echo "Aviso: Arquivo what-is-this.png não encontrado. Certifique-se de ter uma imagem para teste."
fi

# Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "Erro: Docker não está rodando. Inicie o Docker Desktop e tente novamente."
    exit 1
fi

# Define o socket do Docker para macOS (Docker Desktop)
export DOCKER_HOST=unix://$HOME/.docker/run/docker.sock

# Inicia o SAM local
echo "Iniciando SAM local API..."
echo "Endpoint estará disponível em: http://localhost:3000/describe-image"
echo "Para testar, use:"
echo "curl -X POST -H 'Content-Type: image/png' --data-binary @what-is-this.png http://localhost:3000/describe-image"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

sam local start-api --env-vars env.json