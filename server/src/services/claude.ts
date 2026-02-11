import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config'

const client = new Anthropic({ apiKey: config.anthropic.apiKey })

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function isAvailable(): boolean {
  return !!config.anthropic.apiKey && config.anthropic.apiKey !== 'your-claude-api-key-here'
}

export async function* streamChat(
  systemPrompt: string,
  messages: ChatMessage[],
): AsyncGenerator<{ content?: string; done?: boolean; error?: string }> {
  if (!isAvailable()) {
    yield {
      error: 'api_key_missing',
      content:
        'Claude API key is not configured.\n\nTo set up:\n1. Get your API key from https://console.anthropic.com/\n2. Add it to `server/.env` as `ANTHROPIC_API_KEY=sk-ant-...`\n3. Restart the server',
    }
    return
  }

  try {
    const stream = client.messages.stream({
      model: config.anthropic.model,
      max_tokens: config.anthropic.maxTokens,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield { content: event.delta.text }
      }
    }

    yield { done: true }
  } catch (err: any) {
    const message = err?.message || 'AI request failed'
    console.error('Claude API error:', message)

    if (message.includes('authentication') || message.includes('401')) {
      yield { error: 'auth_error', content: 'Invalid API key. Check your ANTHROPIC_API_KEY in server/.env' }
    } else if (message.includes('rate') || message.includes('429')) {
      yield { error: 'rate_limit', content: 'Rate limited. Please wait a moment and try again.' }
    } else {
      yield { error: 'api_error', content: `AI error: ${message}` }
    }
  }
}
