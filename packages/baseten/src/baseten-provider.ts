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
   * Model URL for custom models (chat or embeddings). 
   * If not supplied, the default Models API will be used.
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
  /**
Creates a chat model for text generation. 
*/
  (modelId?: BasetenChatModelId): LanguageModelV2;

  /**
Creates a chat model for text generation. 
*/
  chatModel(modelId?: BasetenChatModelId): LanguageModelV2;

  /**
Creates a language model for text generation. Alias for chatModel.
*/
  languageModel(modelId?: BasetenChatModelId): LanguageModelV2;

  /**
Creates a text embedding model for text generation.
*/
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

  const getCommonModelConfig = (modelType: string, customURL?: string): CommonModelConfig => ({
    provider: `baseten.${modelType}`,
    url: ({ path }) => `${customURL || baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch,
  });

  const createChatModel = (modelId?: BasetenChatModelId) => {
    // Use modelURL if provided, otherwise use default Models API
    const customURL = options.modelURL;
    
    if (customURL) {
      // Check if this is a /sync/v1 endpoint (OpenAI-compatible) or /predict endpoint (custom)
      const isOpenAICompatible = customURL.includes('/sync/v1');
      
      if (isOpenAICompatible) {
        // For /sync/v1 endpoints, use standard OpenAI-compatible format
        return new OpenAICompatibleChatLanguageModel(modelId ?? 'placeholder', {
          ...getCommonModelConfig('chat', customURL),
          errorStructure: basetenErrorStructure,
        });
      } else {
        // For /predict endpoints, use custom format with request transformation
        const model = new OpenAICompatibleChatLanguageModel(modelId ?? 'chat', {
          provider: 'baseten.chat',
          url: ({ path }: { path: string }) => {
            // For custom model URLs, don't append the path - use the URL as-is
            return customURL;
          },
          headers: getHeaders,
          fetch: options.fetch,
          errorStructure: basetenErrorStructure,
        });

        // Override the doGenerate method to transform the request format
        const originalDoGenerate = model.doGenerate.bind(model);
        model.doGenerate = async (params) => {
          // For chat completions, Baseten expects the prompt as 'input'
          if (params.prompt && Array.isArray(params.prompt)) {
            // Convert chat messages to a single input string
            const input = params.prompt
              .map(msg => {
                if (msg.role === 'user') {
                  return msg.content
                    .map(content => 
                      content.type === 'text' ? content.text : ''
                    )
                    .join('');
                }
                return '';
              })
              .filter(text => text.length > 0)
              .join('\n');
            
            // Create Baseten's expected request format
            const basetenRequest = {
              input: input,
            };
            
            // Make the request directly with Baseten's format
            const response = await fetch(customURL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...getHeaders(),
              },
              body: JSON.stringify(basetenRequest),
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Baseten API error: ${response.status} ${errorText}`);
            }
            
            const responseData = await response.json();
            
            // Transform Baseten's response to AI SDK format
            return {
              content: [{ type: 'text', text: responseData.output || responseData.text || '' }],
              finishReason: 'stop',
              usage: {
                inputTokens: responseData.usage?.prompt_tokens,
                outputTokens: responseData.usage?.completion_tokens,
                totalTokens: responseData.usage?.total_tokens,
              },
              response: {
                headers: Object.fromEntries(response.headers.entries()),
                body: JSON.stringify(responseData),
              },
              warnings: [],
            };
          }
          
          return originalDoGenerate(params);
        };

        return model;
      }
    }
    
    // Use default OpenAI-compatible format for Models API
    return new OpenAICompatibleChatLanguageModel(modelId ?? 'chat', {
      ...getCommonModelConfig('chat'),
      errorStructure: basetenErrorStructure,
    });
  };

  const createTextEmbeddingModel = (modelId?: BasetenEmbeddingModelId) => {
    // Use modelURL if provided
    const customURL = options.modelURL;
    if (!customURL) {
      throw new Error('No model URL provided for embeddings. Please set modelURL option for embeddings.');
    }
    
    // Check if this is a /sync/v1 endpoint (OpenAI-compatible) or /predict endpoint (custom)
    const isOpenAICompatible = customURL.includes('/sync/v1');
    
    if (isOpenAICompatible) {
      // For /sync/v1 endpoints, use standard OpenAI-compatible format
      return new OpenAICompatibleEmbeddingModel(modelId ?? 'embeddings', {
        ...getCommonModelConfig('embedding', customURL),
        errorStructure: basetenErrorStructure,
      });
    } else {
      // For /predict endpoints, use custom format
      const model = new OpenAICompatibleEmbeddingModel(modelId ?? 'embeddings', {
        provider: 'baseten.embedding',
        url: ({ path }) => {
          // For custom model URLs, don't append the path - use the URL as-is
          return customURL;
        },
        headers: getHeaders,
        fetch: options.fetch,
        errorStructure: basetenErrorStructure,
      });

      // Override the doEmbed method to transform the request format
      const originalDoEmbed = model.doEmbed.bind(model);
      model.doEmbed = async (params) => {
        // Transform the parameters to Baseten's /predict format
        const transformedParams = { ...params };
        
        // For embeddings, Baseten expects the text as 'input'
        if (params.values && Array.isArray(params.values)) {
          const input = params.values.join('\n');
          (transformedParams as any).input = input;
        }
        
        return originalDoEmbed(transformedParams);
      };

      return model;
    }
  };

  const provider = (modelId?: BasetenChatModelId) => createChatModel(modelId);
  provider.chatModel = createChatModel;
  provider.languageModel = createChatModel;
  provider.imageModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: 'imageModel' });
  };
  provider.textEmbeddingModel = createTextEmbeddingModel;
  return provider;
}

export const baseten = createBaseten();
