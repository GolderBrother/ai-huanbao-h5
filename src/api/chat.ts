import request from './request'
import { API_CONFIG } from '@/config'
import type { ChatMessage } from '@/types'

export const sendChatMessage = async (
  message: string,
  model: string,
  onProgress?: (text: string) => void
) => {
  const config = API_CONFIG[model.toUpperCase()] || {}
  const response = await fetch(config.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.API_KEY}`
    },
    body: JSON.stringify({
      model: config.MODEL,
      messages: [{ role: 'user', content: message }],
      stream: true,
      temperature: config.TEMPERATURE,
      max_tokens: config.MAX_TOKENS
    })
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let accumulatedText = ''

  while (reader) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6))
        if (data.choices?.[0]?.delta?.content) {
          accumulatedText += data.choices[0].delta.content
          onProgress?.(accumulatedText)
        }
      }
    }
  }

  return accumulatedText
}