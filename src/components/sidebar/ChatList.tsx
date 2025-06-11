import React from 'react'
import { MessageSquare } from 'lucide-react'
import { Chat } from '@/types'
import { groupChatsByDate } from '@/utils'
import { ChatItem } from './ChatItem'

interface ChatListProps {
  chats: Chat[]
  currentChatId: string | null
  isDark: boolean
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onUpdateChatTitle: (chatId: string, title: string) => void
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  currentChatId,
  isDark,
  onSelectChat,
  onDeleteChat,
  onUpdateChatTitle
}) => {
  const groupedChats = groupChatsByDate(chats)

  if (chats.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
          No chats yet.<br />Start a new conversation!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedChats).map(([dateGroup, chatsInGroup]) => (
        <div key={dateGroup}>
          <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
            {dateGroup}
          </h3>
          <div className="space-y-1">
            {chatsInGroup.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={currentChatId === chat.id}
                isDark={isDark}
                onSelect={() => onSelectChat(chat.id)}
                onDelete={() => onDeleteChat(chat.id)}
                onUpdateTitle={(title) => onUpdateChatTitle(chat.id, title)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
