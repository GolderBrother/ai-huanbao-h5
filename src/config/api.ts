export const API_CONFIG = {
  DEEPSEEK: {
    API_URL: 'https://api.deepseek.com/v1/chat/completions',
    API_KEY: '',
    MODEL: 'deepseek-chat',
    TEMPERATURE: 0.7,
    MAX_TOKENS: 2000,
    TOP_P: 0.9,
    FREQUENCY_PENALTY: 0,
    PRESENCE_PENALTY: 0
  },
  // ... 其他配置保持不变
} as const 