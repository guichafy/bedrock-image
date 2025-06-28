# Demo AWS Bedrock - Descrição de Imagens

Este projeto demonstra como utilizar o SDK AWS para JavaScript (v3) para enviar uma imagem PNG ou JPG para um modelo do Bedrock e obter uma descrição em texto do que está presente na imagem.
A comunicação com o modelo é feita utilizando a API [Converse](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html).

## Pré‑requisitos

- Node.js 16+ instalado.
- Credenciais AWS configuradas (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `AWS_REGION`).
- Um modelo do Bedrock capaz de processar imagens. O exemplo utiliza o `anthropic.claude-3-sonnet-2024-04-09-v1:0`, mas você pode ajustar a variável `MODEL_ID` conforme necessário.

## Instalação

Clone o repositório e instale as dependências (requer acesso à internet):

```bash
npm install
```

Copie o arquivo `.env.example` para `.env` e ajuste as variáveis, se necessário:

```bash
cp .env.example .env
```

## Uso

Execute o script passando o caminho da imagem (PNG ou JPG) que deseja descrever:

```bash
node get-image-description.js caminho/para/imagem.png
```

A resposta do modelo será exibida no console em formato JSON.

## Observação

Caso esteja utilizando um modelo diferente, atualize a variável `MODEL_ID` no arquivo `.env` ou defina-a via variável de ambiente antes de executar o script.

## Lambda via API Gateway

O diretório `lambda/` contém uma função preparada para ser executada como AWS
Lambda. Ela recebe uma imagem enviada pelo API Gateway e repassa o conteúdo ao
modelo do Bedrock usando a mesma lógica do script de linha de comando.

Para utilizá-la, configure o API Gateway para encaminhar o corpo da requisição
como base64 (definindo `isBase64Encoded: true`). O cabeçalho `Content-Type`
deve indicar o formato da imagem (por exemplo, `image/png`). A resposta da
Lambda será o JSON retornado pelo Bedrock.

### Estrutura da Lambda

A pasta `lambda/` segue uma organização em camadas para facilitar a manutenção do código:

```
lambda/
  src/
    handlers/           # Funções Lambda
    services/           # Integração com Bedrock e processamento de imagem
    utils/              # Utilidades e logger
    config/             # Constantes de configuração
    errors/             # Erros personalizados
  tests/
    unit/
    integration/
  package.json          # Dependências da Lambda
  index.js              # Ponto de entrada que reexporta o handler
```
