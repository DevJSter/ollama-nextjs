'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, AlertCircle, Settings, Copy, Download, Trash2, Moon, Sun, Zap, MessageSquare } from 'lucide-react'
// You'll need to install: npm install react-markdown remark-gfm rehype-highlight
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

type ChatMessage = {
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  id: string
}

type OllamaResponseChunk = {
  message?: {
    role: string
    content: string
  }
  done?: boolean
  error?: string
}

export default function OllamaChatUI() {
  const [prompt, setPrompt] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isDark, setIsDark] = useState<boolean>(true)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt.trim(),
      timestamp: new Date(),
      id: generateId()
    }

    setMessages(prev => [...prev, userMessage])
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
      setMessages(prev => [...prev, botMessage])

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3',
          stream: true,
          messages: [{ role: 'user', content: userMessage.content }],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

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
            const data: OllamaResponseChunk = JSON.parse(line)
            
            if (data.error) {
              throw new Error(data.error)
            }
            
            if (data.done) continue

            if (data.message?.content) {
              botContent += data.message.content
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: botContent,
                }
                return updated
              })
            }
          } catch (parseError) {
            console.error('Error parsing stream chunk:', parseError)
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Chat error:', err)
      
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
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

  const clearChat = () => {
    setMessages([])
    setError('')
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const exportChat = () => {
    const chatData = messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')
    const blob = new Blob([chatData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ollama-chat-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Custom components for ReactMarkdown
  const MarkdownComponents = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      
      if (!inline && match) {
        return (
          <div className={`rounded-md overflow-hidden my-2 ${isDark ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
            <div className={`px-4 py-2 text-xs font-medium border-b ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-neutral-200 border-neutral-300 text-neutral-700'}`}>
              {match[1]}
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        )
      }
      
      return (
        <code
          className={`px-1.5 py-0.5 rounded text-sm font-mono ${isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200 text-neutral-800'}`}
          {...props}
        >
          {children}
        </code>
      )
    },
    pre: ({ children }: any) => children,
    blockquote: ({ children }: any) => (
      <blockquote className={`border-l-4 pl-4 my-2 ${isDark ? 'border-neutral-600 text-neutral-300' : 'border-neutral-400 text-neutral-700'}`}>
        {children}
      </blockquote>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-2">
        <table className={`min-w-full border-collapse border ${isDark ? 'border-neutral-700' : 'border-neutral-300'}`}>
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className={`border px-3 py-2 text-left font-medium ${isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-200' : 'border-neutral-300 bg-neutral-100 text-neutral-800'}`}>
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className={`border px-3 py-2 ${isDark ? 'border-neutral-700 text-neutral-300' : 'border-neutral-300 text-neutral-700'}`}>
        {children}
      </td>
    ),
    p: ({ children }: any) => (
      <p className={`mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
        {children}
      </p>
    ),
    h1: ({ children }: any) => (
      <h1 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
        {children}
      </h3>
    ),
    ul: ({ children }: any) => (
      <ul className={`list-disc list-inside mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className={`list-decimal list-inside mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="mb-1">
        {children}
      </li>
    ),
  }

  // Vercel-inspired color scheme
  const bgClass = isDark 
    ? 'bg-black' 
    : 'bg-white'

  const headerClass = isDark 
    ? 'bg-black border-neutral-800' 
    : 'bg-white border-neutral-200'

  const inputAreaClass = isDark 
    ? 'bg-black border-neutral-800' 
    : 'bg-white border-neutral-200'

  return (
    <div className={`flex flex-col h-screen transition-colors duration-200 ${bgClass}`}>
      {/* Add highlight.js CSS for code syntax highlighting */}
      <link
        rel="stylesheet"
        href={`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${isDark ? 'github-dark' : 'github'}.min.css`}
      />
      
      {/* Vercel-style geometric background pattern (subtle) */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, ${isDark ? '#fff' : '#000'} 2px, transparent 0), radial-gradient(circle at 75px 75px, ${isDark ? '#fff' : '#000'} 2px, transparent 0)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Header */}
      <div className={`relative z-10 flex items-center justify-between px-6 py-4 ${headerClass} border-b`}>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
              Chat
            </h1>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Ollama • llama3 • Markdown Support
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
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
                onClick={exportChat}
                className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={clearChat}
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
        <div className={`relative z-10 px-6 py-3 ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                Model Configuration
              </span>
            </div>
            <div className={`text-xs px-2 py-1 rounded-md ${isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700'}`}>
              Local Instance + Markdown
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
                Ensure Ollama is running: <code className={`px-1 py-0.5 rounded text-xs ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>ollama serve</code>
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
              Ask questions, get help with code, brainstorm ideas, or just have a conversation. Now with full Markdown support!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full max-w-lg">
              {[
                "Help me debug this code",
                "Explain quantum computing",
                "Write a creative story",
                "Show me a table example"
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
                  
                  <div className={`prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''}`}>
                    {message.content ? (
                      message.role === 'bot' ? (
                        <div className={`${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={MarkdownComponents}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className={`whitespace-pre-wrap break-words ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          {message.content}
                        </div>
                      )
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
              className={`w-full px-4 py-3 rounded-lg border resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-400 focus:border-neutral-600' 
                  : 'bg-white border-neutral-300 text-black placeholder-neutral-500 focus:border-neutral-400'
              } disabled:opacity-50`}
              placeholder="Send a message... (Markdown supported)"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!prompt.trim() || isLoading}
            className={`p-3 rounded-lg transition-all ${
              !prompt.trim() || isLoading
                ? (isDark ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')
                : (isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800')
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className={`text-center mt-3 text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
          Powered by Ollama • Running locally • Markdown supported
        </div>
      </div>
    </div>
  )
}