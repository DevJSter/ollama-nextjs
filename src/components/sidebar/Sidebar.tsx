import React from 'react'
import { Chat } from '@/types'
import { SidebarHeader } from './SidebarHeader'
import { ChatList } from './ChatList'

interface SidebarProps {
  isOpen: boolean
  chats: Chat[]
  currentChatId: string | null
  isDark: boolean
  sidebarClass: string
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onUpdateChatTitle: (chatId: string, title: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  chats,
  currentChatId,
  isDark,
  sidebarClass,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onUpdateChatTitle
}) => {
  return (
    <div className={`${isOpen ? 'w-80' : 'w-0'} transition-all duration-200 ${sidebarClass} border-r flex flex-col overflow-hidden`}>
      <SidebarHeader isDark={isDark} onNewChat={onNewChat} />
      
      <div className="flex-1 overflow-y-auto p-4">
        <ChatList
          chats={chats}
          currentChatId={currentChatId}
          isDark={isDark}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
          onUpdateChatTitle={onUpdateChatTitle}
        />
      </div>
    </div>
  )
}
