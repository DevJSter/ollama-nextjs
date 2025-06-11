import React from 'react'
import { Bot, User, Copy } from 'lucide-react'
import { ChatMessage } from '@/types'
import { formatTime, formatMarkdown } from '@/utils'

interface MessageItemProps {
  message: ChatMessage
  isDark: boolean
  isLoading: boolean
  onCopy: (content: string) => void
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isDark,
  isLoading,
  onCopy
}) => {
  return (
    <div className="group">
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
                    ? formatMarkdown(message.content, isDark)
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
              onClick={() => onCopy(message.content)}
              className={`opacity-0 group-hover:opacity-100 transition-opacity mt-2 p-1 rounded hover:${isDark ? 'bg-neutral-800' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-600 hover:text-neutral-800'}`}
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
