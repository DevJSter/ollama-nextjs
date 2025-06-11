import React, { useEffect, useRef } from 'react'
import { ChatMessage } from '@/types'
import { MessageList } from './MessageList'

interface ChatAreaProps {
  messages: ChatMessage[]
  isDark: boolean
  isLoading: boolean
  onSuggestionClick: (suggestion: string) => void
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isDark,
  isLoading,
  onSuggestionClick
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="relative z-10 flex-1 overflow-y-auto">
      <MessageList
        messages={messages}
        isDark={isDark}
        isLoading={isLoading}
        onSuggestionClick={onSuggestionClick}
      />
      <div ref={messagesEndRef} />
    </div>
  )
}
