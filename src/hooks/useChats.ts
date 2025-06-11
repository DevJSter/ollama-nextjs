import { useState, useCallback } from 'react'
import { Chat, ChatMessage } from '@/types'
import { generateId, generateChatTitle, saveChatsToCache } from '@/utils'

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  const currentChat = chats.find(chat => chat.id === currentChatId)

  const createNewChat = useCallback((onCreated?: (chatId: string) => void) => {
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
    
    // Call the callback with the new chat ID if provided
    if (onCreated && typeof onCreated === 'function') {
      // Use setTimeout to ensure state has been updated
      setTimeout(() => onCreated(newChat.id), 0)
    }
    
    return newChat.id
  }, [chats])

  const deleteChat = useCallback((chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId)
    setChats(updatedChats)
    
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
    }
    
    saveChatsToCache(updatedChats)
  }, [chats, currentChatId])

  const updateChatTitle = useCallback((chatId: string, newTitle: string) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: newTitle.trim() || 'Untitled Chat', updatedAt: new Date() }
        : chat
    )
    setChats(updatedChats)
    saveChatsToCache(updatedChats)
  }, [chats])

  const updateCurrentChat = useCallback((newMessages: ChatMessage[]) => {
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
  }, [chats, currentChatId])

  const clearCurrentChat = useCallback(() => {
    if (currentChatId) {
      updateCurrentChat([])
    }
  }, [currentChatId, updateCurrentChat])

  return {
    chats,
    setChats,
    currentChatId,
    setCurrentChatId,
    currentChat,
    createNewChat,
    deleteChat,
    updateChatTitle,
    updateCurrentChat,
    clearCurrentChat
  }
}
