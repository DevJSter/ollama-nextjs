'use client'

import React, { useState, useMemo } from 'react'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { MainArea } from '@/components/layout/MainArea'
import { useChats } from '@/hooks/useChats'
import { useOllama } from '@/hooks/useOllama'
import { useChat } from '@/hooks/useChat'
import { useTheme } from '@/hooks/useTheme'
import { useInitialization } from '@/hooks/useInitialization'
import { exportChat } from '@/utils'

export default function OllamaChatUI() {
  const [prompt, setPrompt] = useState<string>('')
  const [showSettings, setShowSettings] = useState<boolean>(false)

  // Custom hooks
  const { isDark, bgClass, headerClass, sidebarClass, inputAreaClass, toggleTheme } = useTheme()
  const { 
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
  } = useChats()
  
  const { 
    selectedModel, 
    setSelectedModel, 
    availableModels, 
    ollamaUrl, 
    setOllamaUrl, 
    error, 
    setError, 
    checkOllamaConnection 
  } = useOllama()
  
  const { isLoading, sendMessage } = useChat({
    ollamaUrl,
    selectedModel,
    setError,
    updateCurrentChat
  })

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  
  // Initialize app
  useInitialization({ setChats, setCurrentChatId, checkOllamaConnection })

  const messages = useMemo(() => currentChat?.messages || [], [currentChat])

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return

    const currentPrompt = prompt.trim()
    // Clear prompt immediately on send
    setPrompt('')

    // Create new chat if none exists and send message after creation
    if (!currentChatId) {
      createNewChat((newChatId) => {
        // Send message with the new chat ID
        sendMessage(currentPrompt, [], newChatId)
      })
      return
    }

    await sendMessage(currentPrompt, messages, currentChatId)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return
      } else {
        // Send message with Enter
        e.preventDefault()
        if (prompt.trim() && !isLoading) {
          handleSend()
        }
      }
    }
  }

  const handleExportChat = () => {
    if (currentChat) {
      exportChat(currentChat)
    }
  }

  return (
    <div className={`flex h-screen transition-colors duration-200 ${bgClass}`}>
      <Sidebar
        isOpen={sidebarOpen}
        chats={chats}
        currentChatId={currentChatId}
        isDark={isDark}
        sidebarClass={sidebarClass}
        onNewChat={createNewChat}
        onSelectChat={setCurrentChatId}
        onDeleteChat={deleteChat}
        onUpdateChatTitle={updateChatTitle}
      />
      
      <MainArea
        isDark={isDark}
        headerClass={headerClass}
        inputAreaClass={inputAreaClass}
        currentChat={currentChat}
        messages={messages}
        prompt={prompt}
        isLoading={isLoading}
        sidebarOpen={sidebarOpen}
        showSettings={showSettings}
        selectedModel={selectedModel}
        availableModels={availableModels}
        ollamaUrl={ollamaUrl}
        error={error}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onRefreshConnection={checkOllamaConnection}
        onToggleTheme={toggleTheme}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onExportChat={handleExportChat}
        onClearChat={clearCurrentChat}
        onUrlChange={setOllamaUrl}
        onModelChange={setSelectedModel}
        onPromptChange={setPrompt}
        onSend={handleSend}
        onKeyPress={handleKeyPress}
        onSuggestionClick={setPrompt}
      />
    </div>
  )
}