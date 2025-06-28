# Testando a Lambda com SAM Local

Este guia explica como testar a função Lambda localmente usando SAM CLI e suas credenciais AWS existentes.

## Pré-requisitos

1. **SAM CLI instalado**:
   ```bash
   brew install aws-sam-cli
   ```

2. **Credenciais AWS configuradas** em `~/.aws/credentials`:
   ```ini
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY
   aws_secret_access_key = YOUR_SECRET_KEY
   ```

3. **Node.js 18+ instalado**

4. **Dependências instaladas**:
   ```bash
   npm install
   ```

## Arquivos Criados para Teste

- `template.yaml` - Template SAM para definir a infraestrutura
- `env.json` - Variáveis de ambiente para a Lambda
- `test-lambda.sh` - Script para iniciar o servidor local
- `test-api.sh` - Script para testar a API

## Como Testar

### 1. Iniciar o Servidor Local

```bash
./test-lambda.sh
```

Este comando:
- Verifica se o SAM CLI está instalado
- Inicia a API local em `http://localhost:3000`
- Usa automaticamente suas credenciais AWS de `~/.aws/credentials`

### 2. Testar a API (em outro terminal)

```bash
./test-api.sh
```

Ou manualmente com curl:

```bash
curl -X POST \
  -H "Content-Type: image/png" \
  --data-binary @what-is-this.png \
  http://localhost:3000/describe-image
```

### 3. Testar com Diferentes Formatos de Imagem

```bash
# Para JPG
curl -X POST \
  -H "Content-Type: image/jpeg" \
  --data-binary @sua-imagem.jpg \
  http://localhost:3000/describe-image

# Para PNG
curl -X POST \
  -H "Content-Type: image/png" \
  --data-binary @sua-imagem.png \
  http://localhost:3000/describe-image
```

## Configuração de Credenciais

O SAM local automaticamente usa as credenciais AWS do seu ambiente:

1. **Variáveis de ambiente** (prioridade mais alta):
   ```bash
   export AWS_ACCESS_KEY_ID=your_key
   export AWS_SECRET_ACCESS_KEY=your_secret
   export AWS_REGION=us-east-1
   ```

2. **Arquivo de credenciais** `~/.aws/credentials`:
   ```ini
   [default]
   aws_access_key_id = your_key
   aws_secret_access_key = your_secret
   region = us-east-1
   ```

3. **Perfil específico**:
   ```bash
   export AWS_PROFILE=seu-perfil
   ./test-lambda.sh
   ```

## Personalização

### Alterar o Modelo do Bedrock

Edite o arquivo `env.json`:

```json
{
  "BedrockImageFunction": {
    "AWS_REGION": "us-east-1",
    "MODEL_ID": "anthropic.claude-3-haiku-20240307-v1:0"
  }
}
```

### Alterar a Região AWS

Edite o arquivo `env.json` e altere `AWS_REGION`:

```json
{
  "BedrockImageFunction": {
    "AWS_REGION": "us-west-2",
    "MODEL_ID": "anthropic.claude-3-sonnet-2024-04-09-v1:0"
  }
}
```

## Troubleshooting

### Erro de Credenciais

```
Unable to locate credentials
```

**Solução**: Verifique se suas credenciais AWS estão configuradas:

```bash
aws configure list
```

### Erro de Permissões

```
User is not authorized to perform: bedrock:InvokeModel
```

**Solução**: Certifique-se de que sua conta AWS tem permissões para usar o Bedrock.

### Porta em Uso

```
Port 3000 is already in use
```

**Solução**: Use uma porta diferente:

```bash
sam local start-api --port 3001 --env-vars env.json
```

### Modelo Não Disponível

```
ValidationException: The model ID is not supported
```

**Solução**: Verifique se o modelo está disponível na sua região e se você tem acesso a ele no console do Bedrock.

## Logs e Debug

Para ver logs detalhados:

```bash
sam local start-api --env-vars env.json --debug
```

Para ver logs da Lambda em tempo real:

```bash
sam logs -n BedrockImageFunction --stack-name bedrock-image --tail
```