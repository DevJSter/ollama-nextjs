import React from 'react'
import { ChatMessage } from '@/types'
import { copyToClipboard } from '@/utils'
import { EmptyState } from './EmptyState'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  messages: ChatMessage[]
  isDark: boolean
  isLoading: boolean
  onSuggestionClick: (suggestion: string) => void
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isDark,
  isLoading,
  onSuggestionClick
}) => {
  if (messages.length === 0) {
    return <EmptyState isDark={isDark} onSuggestionClick={onSuggestionClick} />
  }

  return (
    <div className="space-y-6 p-6">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isDark={isDark}
          isLoading={isLoading}
          onCopy={copyToClipboard}
        />
      ))}
    </div>
  )
}
