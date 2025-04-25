// Define explicit type for GrokChatMessage (XAI-compatible)
export interface GrokChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokChatRequest {
  messages: GrokChatMessage[];
  model?: string;
  stream?: boolean;
  temperature?: number;
}

export interface GrokChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

export async function callGrokChat(req: GrokChatRequest): Promise<GrokChatResponse> {
  const apiKey = process.env.GROK_API_KEY;
  const apiUrl = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions';
  if (!apiKey) throw new Error('Missing GROK_API_KEY');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      ...req,
      model: req.model || 'grok-3-latest',
      stream: req.stream ?? false,
      temperature: req.temperature ?? 0,
    }),
  });
  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
