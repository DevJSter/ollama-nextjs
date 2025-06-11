import { ChatMessage, Chat } from '@/types'
import { STORAGE_KEY } from '@/constants'

export const generateId = (): string => Math.random().toString(36).substr(2, 9)

export const generateChatTitle = (firstMessage: string): string => {
  const words = firstMessage.split(' ').slice(0, 6)
  return words.join(' ') + (words.length < firstMessage.split(' ').length ? '...' : '')
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const formatDate = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}

export const formatMarkdown = (text: string, isDark: boolean): string => {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="${isDark ? 'bg-neutral-900 text-neutral-200' : 'bg-neutral-100 text-neutral-800'} p-4 rounded-md overflow-x-auto my-2"><code>${code.trim()}</code></pre>`
    })
    .replace(/`([^`]+)`/g, `<code class="${isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200 text-neutral-800'} px-1.5 py-0.5 rounded text-sm font-mono">$1</code>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

export const loadChatsFromCache = (): Chat[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsedChats = (JSON.parse(cached) as Chat[]).map((chat: Chat) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: chat.messages.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
      return parsedChats
    }
  } catch (error) {
    console.error('Error loading chats from cache:', error)
  }
  return []
}

export const saveChatsToCache = (chats: Chat[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch (error) {
    console.error('Error saving chats to cache:', error)
  }
}

export const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text)
}

export const exportChat = (chat: Chat): void => {
  const chatData = chat.messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')
  const blob = new Blob([chatData], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const groupChatsByDate = (chats: Chat[]): { [key: string]: Chat[] } => {
  return chats.reduce((groups: { [key: string]: Chat[] }, chat) => {
    const dateKey = formatDate(chat.updatedAt)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(chat)
    return groups
  }, {})
}
