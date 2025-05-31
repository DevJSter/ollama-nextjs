'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, AlertCircle, Settings, Copy, Download, Trash2, Moon, Sun, Zap, MessageSquare, RefreshCw, Plus, Edit3, Check, X, Menu, Sidebar } from 'lucide-react'

type ChatMessage = {
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  id: string
}

type Chat = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

type OllamaResponseChunk = {
  message?: {
    role: string
    content: string
  }
  done?: boolean
  error?: string
}

const STORAGE_KEY = 'ollama-chats'

export default function OllamaChatUI() {
  const [prompt, setPrompt] = useState<string>('')
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isDark, setIsDark] = useState<boolean>(true)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2')
  const [availableModels, setAvailableModels] = useState<string[]>(['llama3.2', 'llama3', 'llama2', 'codellama'])
  const [ollamaUrl, setOllamaUrl] = useState<string>('http://localhost:11434')
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const currentChat = chats.find(chat => chat.id === currentChatId)
  const messages = currentChat?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
    checkOllamaConnection()
    loadChatsFromCache()
  }, [])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const loadChatsFromCache = () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsedChats = JSON.parse(cached).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
        setChats(parsedChats)
        
        // Set the most recent chat as current
        if (parsedChats.length > 0) {
          const mostRecent = parsedChats.sort((a: Chat, b: Chat) => 
            b.updatedAt.getTime() - a.updatedAt.getTime()
          )[0]
          setCurrentChatId(mostRecent.id)
        }
      }
    } catch (error) {
      console.error('Error loading chats from cache:', error)
    }
  }

  const saveChatsToCache = (updatedChats: Chat[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats))
    } catch (error) {
      console.error('Error saving chats to cache:', error)
    }
  }

  const createNewChat = () => {
    const newChat: Chat = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedChats = [newChat, ...chats]
    setChats(updatedChats)
    setCurrentChatId(newChat.id)
    saveChatsToCache(updatedChats)
  }

  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId)
    setChats(updatedChats)
    
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
    }
    
    saveChatsToCache(updatedChats)
  }

  const updateChatTitle = (chatId: string, newTitle: string) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: newTitle.trim() || 'Untitled Chat', updatedAt: new Date() }
        : chat
    )
    setChats(updatedChats)
    saveChatsToCache(updatedChats)
  }

  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 6)
    return words.join(' ') + (words.length < firstMessage.split(' ').length ? '...' : '')
  }

  const updateCurrentChat = (newMessages: ChatMessage[]) => {
    if (!currentChatId) return

    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        const updatedChat = {
          ...chat,
          messages: newMessages,
          updatedAt: new Date()
        }
        
        // Auto-generate title from first message if still "New Chat"
        if (chat.title === 'New Chat' && newMessages.length > 0) {
          updatedChat.title = generateChatTitle(newMessages[0].content)
        }
        
        return updatedChat
      }
      return chat
    })
    
    setChats(updatedChats)
    saveChatsToCache(updatedChats)
  }

  const checkOllamaConnection = async () => {
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`)
      if (response.ok) {
        const data = await response.json()
        const modelNames = data.models?.map((model: any) => model.name) || []
        if (modelNames.length > 0) {
          setAvailableModels(modelNames)
          if (!modelNames.includes(selectedModel)) {
            setSelectedModel(modelNames[0])
          }
        }
        setError('')
      }
    } catch (err) {
      console.log('Ollama connection check failed:', err)
    }
  }

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return

    // Create new chat if none exists
    if (!currentChatId) {
      createNewChat()
      // Wait for the state to update
      setTimeout(() => handleSend(), 100)
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt.trim(),
      timestamp: new Date(),
      id: generateId()
    }

    const currentMessages = [...messages, userMessage]
    updateCurrentChat(currentMessages)
    setPrompt('')
    setIsLoading(true)
    setError('')

    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      const botMessage: ChatMessage = {
        role: 'bot',
        content: '',
        timestamp: new Date(),
        id: generateId()
      }
      
      const messagesWithBot = [...currentMessages, botMessage]
      updateCurrentChat(messagesWithBot)

      // Prepare conversation history for context
      const conversationHistory = currentMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      // Try chat endpoint first (supports conversation history)
      let response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          stream: true,
          messages: conversationHistory,
        }),
      })

      if (!response.ok) {
        // Fallback to generate endpoint with context as a single prompt
        const contextPrompt = conversationHistory
          .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
          .join('\n\n') + '\n\nAssistant:'

        response = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: contextPrompt,
            stream: true,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}. Try checking if the model '${selectedModel}' is available.`)
        }
      }

      await handleStreamResponse(response, messagesWithBot)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Chat error:', err)
      
      // Remove the empty bot message on error
      updateCurrentChat(currentMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStreamResponse = async (response: Response, initialMessages: ChatMessage[]) => {
    if (!response.body) {
      throw new Error('No response body received')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let botContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(Boolean)

      for (const line of lines) {
        try {
          const data: any = JSON.parse(line)
          
          if (data.error) {
            throw new Error(data.error)
          }
          
          if (data.done) continue

          // Handle both generate and chat API responses
          const content = data.response || data.message?.content || ''
          if (content) {
            botContent += content
            const updatedMessages = [...initialMessages]
            updatedMessages[updatedMessages.length - 1] = {
              ...updatedMessages[updatedMessages.length - 1],
              content: botContent,
            }
            updateCurrentChat(updatedMessages)
          }
        } catch (parseError) {
          console.error('Error parsing stream chunk:', parseError)
        }
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const clearCurrentChat = () => {
    if (currentChatId) {
      updateCurrentChat([])
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const exportCurrentChat = () => {
    if (!currentChat) return
    
    const chatData = currentChat.messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')
    const blob = new Blob([chatData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentChat.title.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const formatMarkdown = (text: string) => {
    // Simple markdown formatting for code blocks and inline code
    return text
      .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="${isDark ? 'bg-neutral-900 text-neutral-200' : 'bg-neutral-100 text-neutral-800'} p-4 rounded-md overflow-x-auto my-2"><code>${code.trim()}</code></pre>`
      })
      .replace(/`([^`]+)`/g, `<code class="${isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200 text-neutral-800'} px-1.5 py-0.5 rounded text-sm font-mono">$1</code>`)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
  }

  const startEditingTitle = (chat: Chat) => {
    setEditingChatId(chat.id)
    setEditingTitle(chat.title)
  }

  const saveEditingTitle = () => {
    if (editingChatId) {
      updateChatTitle(editingChatId, editingTitle)
    }
    setEditingChatId(null)
    setEditingTitle('')
  }

  const cancelEditingTitle = () => {
    setEditingChatId(null)
    setEditingTitle('')
  }

  // Group chats by date
  const groupedChats = chats.reduce((groups: { [key: string]: Chat[] }, chat) => {
    const dateKey = formatDate(chat.updatedAt)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(chat)
    return groups
  }, {})

  // Vercel-inspired color scheme
  const bgClass = isDark ? 'bg-black' : 'bg-white'
  const headerClass = isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-200'
  const sidebarClass = isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
  const inputAreaClass = isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-200'

  return (
    <div className={`flex h-screen transition-colors duration-200 ${bgClass}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-200 ${sidebarClass} border-r flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-800">
          <button
            onClick={createNewChat}
            className={`w-full p-3 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${
              isDark 
                ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-900/50 text-neutral-300' 
                : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(groupedChats).map(([dateGroup, chatsInGroup]) => (
            <div key={dateGroup}>
              <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                {dateGroup}
              </h3>
              <div className="space-y-1">
                {chatsInGroup.map(chat => (
                  <div
                    key={chat.id}
                    className={`group p-3 rounded-lg cursor-pointer transition-colors relative ${
                      currentChatId === chat.id
                        ? (isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black')
                        : (isDark ? 'hover:bg-neutral-900/50 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700')
                    }`}
                    onClick={() => setCurrentChatId(chat.id)}
                  >
                    {editingChatId === chat.id ? (
                      <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className={`flex-1 bg-transparent border-none outline-none text-sm ${
                            isDark ? 'text-white' : 'text-black'
                          }`}
                          onKeyPress={(e) => e.key === 'Enter' && saveEditingTitle()}
                          autoFocus
                        />
                        <button
                          onClick={saveEditingTitle}
                          className="p-1 rounded text-green-500 hover:bg-green-500/20"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditingTitle}
                          className="p-1 rounded text-red-500 hover:bg-red-500/20"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate pr-2">
                            {chat.title}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingTitle(chat)
                              }}
                              className={`p-1 rounded transition-colors ${
                                isDark ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-300 text-neutral-600'
                              }`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteChat(chat.id)
                              }}
                              className="p-1 rounded transition-colors hover:bg-red-500/20 text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                          {chat.messages.length} messages
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {chats.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
              <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                No chats yet.<br />Start a new conversation!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`relative z-10 flex items-center justify-between px-6 py-4 ${headerClass} border-b`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
            >
              {sidebarOpen ? <Sidebar className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                {currentChat?.title || 'Chat'}
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Ollama • {selectedModel} • Local
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={checkOllamaConnection}
              className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
              title="Refresh connection"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {messages.length > 0 && (
              <>
                <button
                  onClick={exportCurrentChat}
                  className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={clearCurrentChat}
                  className={`p-2 rounded-md transition-colors hover:bg-red-50 text-red-500 hover:text-red-600`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className={`relative z-10 px-6 py-4 ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'} border-b`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                    Model Configuration
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Ollama URL
                  </label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border ${
                      isDark 
                        ? 'bg-neutral-900 border-neutral-700 text-white' 
                        : 'bg-white border-neutral-300 text-black'
                    }`}
                    placeholder="http://localhost:11434"
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border ${
                      isDark 
                        ? 'bg-neutral-900 border-neutral-700 text-white' 
                        : 'bg-white border-neutral-300 text-black'
                    }`}
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className={`relative z-10 mx-6 mt-4 p-4 border rounded-lg ${isDark ? 'bg-red-950/50 border-red-900/50' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className={`font-medium text-sm ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                  Connection Error
                </div>
                <div className={`text-sm mt-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                  {error}
                </div>
                <div className={`text-xs mt-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  Troubleshooting:
                  <br />• Ensure Ollama is running: <code className={`px-1 py-0.5 rounded text-xs ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>ollama serve</code>
                  <br />• Check if model exists: <code className={`px-1 py-0.5 rounded text-xs ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>ollama list</code>
                  <br />• Pull model if needed: <code className={`px-1 py-0.5 rounded text-xs ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>ollama pull {selectedModel}</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Start a conversation
              </h3>
              <p className={`text-center max-w-md ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Ask questions, get help with code, brainstorm ideas, or just have a conversation with your local Ollama model.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full max-w-lg">
                {[
                  "Help me debug this code",
                  "Explain quantum computing",
                  "Write a creative story",
                  "Show me a code example"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(suggestion)}
                    className={`p-3 text-left text-sm rounded-lg border transition-colors ${
                      isDark 
                        ? 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50 text-neutral-300' 
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6 p-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className="group"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? (isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200 text-neutral-800')
                      : (isDark ? 'bg-white text-black' : 'bg-black text-white')
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-3 h-3" />
                    ) : (
                      <Bot className="w-3 h-3" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      {message.content ? (
                        <div 
                          className={`break-words ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}
                          dangerouslySetInnerHTML={{ 
                            __html: message.role === 'bot' 
                              ? formatMarkdown(message.content)
                              : message.content.replace(/\n/g, '<br>')
                          }}
                        />
                      ) : (isLoading && message.role === 'bot' ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className={`w-1 h-1 rounded-full animate-bounce ${isDark ? 'bg-neutral-400' : 'bg-neutral-600'}`}></div>
                            <div className={`w-1 h-1 rounded-full animate-bounce ${isDark ? 'bg-neutral-400' : 'bg-neutral-600'}`} style={{ animationDelay: '0.1s' }}></div>
                            <div className={`w-1 h-1 rounded-full animate-bounce ${isDark ? 'bg-neutral-400' : 'bg-neutral-600'}`} style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Thinking...</span>
                        </div>
                      ) : null)}
                    </div>
                    
                    {message.content && (
                      <button
                        onClick={() => copyMessage(message.content)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity mt-2 p-1 rounded hover:${isDark ? 'bg-neutral-800' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-600 hover:text-neutral-800'}`}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`relative z-10 p-6 ${inputAreaClass} border-t`}>
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                rows={1}
                className={`w-full px-4 py-3 pr-12 rounded-lg border resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
                  isDark 
                    ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-400 focus:border-neutral-600' 
                    : 'bg-white border-neutral-300 text-black placeholder-neutral-500 focus:border-neutral-400'
                } disabled:opacity-50`}
                placeholder="Send a message..."
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={!prompt.trim() || isLoading}
                className={`absolute right-2 bottom-2 p-2 rounded-md transition-all ${
                  !prompt.trim() || isLoading
                    ? (isDark ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')
                    : (isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800')
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className={`text-center mt-3 text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
            Powered by Ollama • Running locally • Model: {selectedModel} • {messages.length > 0 ? `${Math.floor(messages.length / 2)} messages in context` : 'No context'}
          </div>
        </div>
      </div>
    </div>
  )
}