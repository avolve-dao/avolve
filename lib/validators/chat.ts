import { z } from 'zod';

/**
 * Validation schema for chat API requests
 */
export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(100),
  model: z.string().optional(),
  systemPrompt: z.string().optional(),
});

/**
 * Validation schema for Grok chat API requests
 */
export const grokChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(100),
  userId: z.string().optional(),
});

/**
 * Type for validated chat request
 */
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Type for validated Grok chat request
 */
export type GrokChatRequest = z.infer<typeof grokChatRequestSchema>;

/**
 * Validates a chat API request
 * @returns Validated request data or throws an error
 */
export function validateChatRequest(data: unknown): ChatRequest {
  return chatRequestSchema.parse(data);
}

/**
 * Validates a Grok chat API request
 * @returns Validated request data or throws an error
 */
export function validateGrokChatRequest(data: unknown): GrokChatRequest {
  return grokChatRequestSchema.parse(data);
}

/**
 * Safely validates a chat API request
 * @returns Validation result with success flag
 */
export function safeValidateChatRequest(data: unknown): {
  success: boolean;
  data?: ChatRequest;
  error?: z.ZodError;
} {
  try {
    const validData = validateChatRequest(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Safely validates a Grok chat API request
 * @returns Validation result with success flag
 */
export function safeValidateGrokChatRequest(data: unknown): {
  success: boolean;
  data?: GrokChatRequest;
  error?: z.ZodError;
} {
  try {
    const validData = validateGrokChatRequest(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}
