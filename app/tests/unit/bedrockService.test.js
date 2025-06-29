const sendMock = jest.fn();

jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn(),
  ConverseCommand: jest.fn()
}));

jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn()
}));

beforeEach(() => {
  jest.resetModules();
  const br = require('@aws-sdk/client-bedrock-runtime');
  br.BedrockRuntimeClient.mockImplementation(function(){ this.send = sendMock; });
  br.ConverseCommand.mockImplementation(function(params){ this.params = params; });
  br.BedrockRuntimeClient.mockClear();
  br.ConverseCommand.mockClear();
  sendMock.mockReset();
  delete process.env.AWS_REGION;
  delete process.env.MODEL_ID;
});

test('describeImage sends command with correct params', async () => {
  process.env.AWS_REGION = 'sa-east-1';
  process.env.MODEL_ID = 'model-id';
  jest.resetModules();
  const br = require('@aws-sdk/client-bedrock-runtime');
  br.BedrockRuntimeClient.mockImplementation(function(){ this.send = sendMock; });
  br.ConverseCommand.mockImplementation(function(params){ this.params = params; });
  const { describeImage } = require('../../src/services/bedrockService');
  const bytes = Buffer.from('abcd');
  sendMock.mockResolvedValue('ok');
  const result = await describeImage(bytes, 'png');
  expect(br.BedrockRuntimeClient).toHaveBeenCalledWith({ region: 'sa-east-1' });
  expect(br.ConverseCommand).toHaveBeenCalledWith(expect.objectContaining({ modelId: 'model-id' }));
  expect(sendMock).toHaveBeenCalled();
  expect(result).toBe('ok');
});
