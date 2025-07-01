import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { createBaseten } from './baseten-provider';
import { LanguageModelV2 } from '@ai-sdk/provider';
import { loadApiKey } from '@ai-sdk/provider-utils';
import { OpenAICompatibleChatLanguageModel } from '@ai-sdk/openai-compatible';

// Add type assertion for the mocked class
const OpenAICompatibleChatLanguageModelMock =
  OpenAICompatibleChatLanguageModel as unknown as Mock;

vi.mock('@ai-sdk/openai-compatible', () => {
  // Create mock constructor functions that behave like classes
  const createMockConstructor = (providerName: string) => {
    const mockConstructor = vi.fn().mockImplementation(function (
      this: any,
      modelId: string,
      settings: any,
    ) {
      this.provider = providerName;
      this.modelId = modelId;
      this.settings = settings;
    });
    return mockConstructor;
  };

  return {
    OpenAICompatibleChatLanguageModel: createMockConstructor('baseten.chat'),
  };
});

vi.mock('@ai-sdk/provider-utils', () => ({
  loadApiKey: vi.fn().mockReturnValue('mock-api-key'),
  withoutTrailingSlash: vi.fn(url => url),
}));

describe('BasetenProvider', () => {
  let mockLanguageModel: LanguageModelV2;

  beforeEach(() => {
    // Mock implementations of models
    mockLanguageModel = {
      // Add any required methods for LanguageModelV2
    } as LanguageModelV2;

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('createBaseten', () => {
    it('should create a BasetenProvider instance with default options', () => {
      const provider = createBaseten();
      const model = provider.chatModel('deepseek-ai/DeepSeek-V3-0324');

      // Use the mocked version
      const constructorCall =
        OpenAICompatibleChatLanguageModelMock.mock.calls[0];
      const config = constructorCall[1];
      config.headers();

      expect(loadApiKey).toHaveBeenCalledWith({
        apiKey: undefined,
        environmentVariableName: 'BASETEN_API_KEY',
        description: 'Baseten API key',
      });
    });

    it('should create a BasetenProvider instance with custom options', () => {
      const options = {
        apiKey: 'custom-key',
        baseURL: 'https://custom.url',
        headers: { 'Custom-Header': 'value' },
      };
      const provider = createBaseten(options);
      const model = provider.chatModel('deepseek-ai/DeepSeek-V3-0324');

      const constructorCall =
        OpenAICompatibleChatLanguageModelMock.mock.calls[0];
      const config = constructorCall[1];
      config.headers();

      expect(loadApiKey).toHaveBeenCalledWith({
        apiKey: 'custom-key',
        environmentVariableName: 'BASETEN_API_KEY',
        description: 'Baseten API key',
      });
    });

    it('should return a chat model when called as a function', () => {
      const provider = createBaseten();
      const modelId = 'deepseek-ai/DeepSeek-V3-0324';

      const model = provider.chatModel(modelId);
      expect(model).toBeInstanceOf(OpenAICompatibleChatLanguageModel);
    });
  });

  describe('chatModel', () => {
    it('should construct a chat model with correct configuration', () => {
      const provider = createBaseten();
      const modelId = 'deepseek-ai/DeepSeek-V3-0324';

      const model = provider.chatModel(modelId);

      expect(model).toBeInstanceOf(OpenAICompatibleChatLanguageModel);
    });
  });

  describe('languageModel', () => {
    it('should construct a language model with correct configuration', () => {
      const provider = createBaseten();
      const modelId = 'deepseek-ai/DeepSeek-V3-0324';

      const model = provider.languageModel(modelId);

      expect(model).toBeInstanceOf(OpenAICompatibleChatLanguageModel);
    });
  });
});
