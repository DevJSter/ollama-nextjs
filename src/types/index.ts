export type ChatMessage = {
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  id: string
}

export type Chat = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export type OllamaResponseChunk = {
  message?: {
    role: string
    content: string
  }
  done?: boolean
  error?: string
}

export type Theme = 'light' | 'dark'
