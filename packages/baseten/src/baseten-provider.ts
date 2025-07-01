import {
  OpenAICompatibleChatLanguageModel,
  OpenAICompatibleEmbeddingModel,
  ProviderErrorStructure,
} from '@ai-sdk/openai-compatible';
import {
  EmbeddingModelV2,
  LanguageModelV2,
  NoSuchModelError,
  ProviderV2,
} from '@ai-sdk/provider';
import {
  FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { z } from 'zod/v4';
import { BasetenChatModelId } from './baseten-chat-options';
import { BasetenEmbeddingModelId } from './baseten-embedding-options';

export type BasetenErrorData = z.infer<typeof basetenErrorSchema>;

const basetenErrorSchema = z.object({
  error: z.string(),
});

const basetenErrorStructure: ProviderErrorStructure<BasetenErrorData> = {
  errorSchema: basetenErrorSchema,
  errorToMessage: data => data.error,
};

export interface BasetenProviderSettings {
  /**
   * Baseten API key. Default value is taken from the `BASETEN_API_KEY`
   * environment variable.
   */
  apiKey?: string;
  
  /**
   * Base URL for the Models API. Default: 'https://inference.baseten.co/v1'
   */
  baseURL?: string;
  
  /**
   * Model URL for embeddings. Default value is taken from the `BASETEN_MODEL_URL`
   * environment variable.
   */
  modelURL?: string;
  /**
   * Custom headers to include in the requests.
   */
  headers?: Record<string, string>;
  
  /**
   * Custom fetch implementation. You can use it as a middleware to intercept requests,
   * or to provide a custom fetch implementation for e.g. testing.
   */
  fetch?: FetchFunction;
}

export interface BasetenProvider extends ProviderV2 {
  (modelId: BasetenChatModelId): LanguageModelV2;
  /**
Creates a chat model for text generation. 
*/
  chatModel(modelId: BasetenChatModelId): LanguageModelV2;

  textEmbeddingModel(
    modelId?: BasetenEmbeddingModelId,
  ): EmbeddingModelV2<string>;
  
}

// by default, we use the models API
const defaultBaseURL = 'https://inference.baseten.co/v1';

export function createBaseten(
  options: BasetenProviderSettings = {},
): BasetenProvider {
  const baseURL = withoutTrailingSlash(options.baseURL ?? defaultBaseURL);
  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: 'BASETEN_API_KEY',
      description: 'Baseten API key',
    })}`,
    ...options.headers,
  });

  interface CommonModelConfig {
    provider: string;
    url: ({ path }: { path: string }) => string;
    headers: () => Record<string, string>;
    fetch?: FetchFunction;
  }

  const getCommonModelConfig = (modelType: string): CommonModelConfig => ({
    provider: `baseten.${modelType}`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch,
  });

  const createChatModel = (modelId: BasetenChatModelId) => {
    return new OpenAICompatibleChatLanguageModel(modelId, {
      ...getCommonModelConfig('chat'),
      errorStructure: basetenErrorStructure,
    });
  };

  const createTextEmbeddingModel = (modelId?: BasetenEmbeddingModelId) => {
    // Use modelURL if provided as user input or environment variable
    const embeddingURL = options.modelURL ?? loadApiKey({
      apiKey: options.modelURL,
      environmentVariableName: 'BASETEN_MODEL_URL',
      description: 'Baseten model URL for embeddings',
    });
    if (!embeddingURL) {
      throw new Error('No model URL provided');
    }
    
    return new OpenAICompatibleEmbeddingModel(modelId ?? 'embeddings', {
      provider: 'baseten.embedding',
      url: ({ path }) => `${embeddingURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
      errorStructure: basetenErrorStructure,
    });
  };

  const provider = (modelId: BasetenChatModelId) => createChatModel(modelId);
  provider.chatModel = createChatModel;
  provider.languageModel = createChatModel;
  provider.imageModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: 'imageModel' });
  };
  provider.textEmbeddingModel = createTextEmbeddingModel;
  return provider;
}

export const baseten = createBaseten();
