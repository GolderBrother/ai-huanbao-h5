import { API_CONFIG } from '@/config'
export const sendChatMessage = async (
  message: string,
  model: string,
  onProgress?: (text: string) => void
) => {
  const config: any = API_CONFIG[model.toUpperCase() as unknown as keyof typeof API_CONFIG] || {}
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
        const jsonStr = line.slice(6).trim()
        // 跳过 [DONE] 标记
        if (jsonStr === '[DONE]') continue
        
        try {
          const data = JSON.parse(jsonStr)
          if (data.choices?.[0]?.delta?.content) {
            accumulatedText += data.choices[0].delta.content
            onProgress?.(accumulatedText)
          }
        } catch (e) {
          console.warn('解析响应数据失败:', e)
          continue
        }
      }
    }
  }

  return accumulatedText
}