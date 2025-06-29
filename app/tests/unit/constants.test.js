const path = require('path');

describe('config constants', () => {
  afterEach(() => {
    jest.resetModules();
    delete process.env.AWS_REGION;
    delete process.env.MODEL_ID;
  });

  test('uses environment variables when defined', () => {
    process.env.AWS_REGION = 'sa-east-1';
    process.env.MODEL_ID = 'test-model';
    const constants = require('../../src/config/constants');
    expect(constants.DEFAULT_REGION).toBe('sa-east-1');
    expect(constants.DEFAULT_MODEL).toBe('test-model');
  });

  test('falls back to default values', () => {
    const constants = require('../../src/config/constants');
    expect(constants.DEFAULT_REGION).toBe('us-east-1');
    expect(constants.DEFAULT_MODEL).toBe('anthropic.claude-3-sonnet-2024-04-09-v1:0');
  });
});
