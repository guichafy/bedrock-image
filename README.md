# Demo AWS Bedrock - Descrição de Imagens

Este projeto demonstra como utilizar o SDK AWS para JavaScript (v3) para enviar uma imagem PNG ou JPG para um modelo do Bedrock e obter uma descrição em texto do que está presente na imagem.
A comunicação com o modelo é feita utilizando a API [Converse](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html).

## Pré‑requisitos

- Node.js 18+ instalado.
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

1. Inicie o servidor local do SAM:

```bash
./tests/run-lambda-server.sh
```

2. Em outro terminal, envie uma imagem como arquivo multipart para a API local:

```bash
./tests/test-api-file.sh
```

A resposta do modelo será exibida no console em formato JSON.

## Observação

Caso esteja utilizando um modelo diferente, atualize a variável `MODEL_ID` no arquivo `.env` ou defina-a via variável de ambiente antes de executar o script.

## Principais mudanças da refatoração

- **Processamento robusto de imagens**: a função de processamento tenta diferentes formas de decodificar os bytes recebidos, permitindo chamadas em base64, binário ou JSON.
- **Suporte a múltiplos formatos**: validação para PNG, JPEG, GIF e WebP.
- **Logs de depuração detalhados**: ativados para facilitar a análise de erros.
- **Scripts de teste**: `run-lambda-server.sh` inicia a API local e `test-api-file.sh` envia uma imagem de exemplo.

## Lambda via API Gateway

O diretório `app/` contém a função preparada para ser executada como AWS
Lambda. Ela recebe uma imagem enviada pelo API Gateway e repassa o conteúdo ao
modelo do Bedrock usando a mesma lógica do script de linha de comando.

Para utilizá-la, configure o API Gateway para encaminhar o corpo da requisição
como base64 (definindo `isBase64Encoded: true`) ao enviar arquivos no formato
`multipart/form-data`. O cabeçalho `Content-Type` deve conter o boundary
correto e a resposta da Lambda será o JSON retornado pelo Bedrock.

### Estrutura da Lambda

A pasta `app/` segue uma organização em camadas para facilitar a manutenção do código:

```
app/
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

## Integração contínua

Um fluxo de trabalho do GitHub Actions executa os testes automatizados
sempre que um pull request é aberto para a branch `main`. O workflow
instala as dependências na pasta `app/` e roda os comandos `npm test`
e `npm run coverage` para garantir que a cobertura mínima de testes seja
atingida.
