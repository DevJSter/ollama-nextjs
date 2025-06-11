import React, { useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  prompt: string
  isLoading: boolean
  isDark: boolean
  inputAreaClass: string
  selectedModel: string
  messagesLength: number
  onPromptChange: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  prompt,
  isLoading,
  isDark,
  inputAreaClass,
  selectedModel,
  messagesLength,
  onPromptChange,
  onSend,
  onKeyPress
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Handle external prompt changes (like clearing)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }, [prompt])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange(e.target.value)
    // Reset height first to get accurate scrollHeight
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className={`relative z-10 p-6 ${inputAreaClass} border-t`}>
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={handleInputChange}
            onKeyPress={onKeyPress}
            disabled={isLoading}
            rows={1}
            className={`w-full px-4 py-4 pr-12 rounded-xl border resize-none transition-all duration-200 focus:outline-none focus:ring-2 ${
              isDark 
                ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-400 focus:border-neutral-600 focus:ring-neutral-600' 
                : 'bg-white border-neutral-300 text-black placeholder-neutral-500 focus:border-neutral-400 focus:ring-neutral-400'
            } disabled:opacity-50`}
            placeholder="Send a message..."
            style={{ minHeight: '52px', maxHeight: '120px' }}
          />
          <button
            onClick={onSend}
            disabled={!prompt.trim() || isLoading}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 -mt-1 p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              !prompt.trim() || isLoading
                ? (isDark ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')
                : (isDark ? 'bg-neutral-600 text-white hover:bg-neutral-500 active:scale-95' : 'bg-neutral-800 text-white hover:bg-neutral-700 active:scale-95')
            }`}
            title={prompt.trim() ? 'Send message (Enter)' : 'Type a message to send'}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      <div className={`text-center mt-3 text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
        Powered by Ollama • Running locally • Altho Mistral is best accroding to Grok • Selected Model: {selectedModel} • {messagesLength > 0 ? `${Math.floor(messagesLength / 2)} messages in context` : 'No context' }
      </div>
    </div>
  )
}
