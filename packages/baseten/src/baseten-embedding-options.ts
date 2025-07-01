import { z } from 'zod/v4';

// https://www.baseten.co/library/tag/embedding/

export type BasetenEmbeddingModelId =
  | (string & {});

export const basetenEmbeddingProviderOptions = z.object({});

export type BasetenEmbeddingProviderOptions = z.infer<
  typeof basetenEmbeddingProviderOptions
>;
