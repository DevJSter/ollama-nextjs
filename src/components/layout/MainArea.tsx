import React from 'react'
import { Chat, ChatMessage } from '@/types'
import { Header } from '../header/Header'
import { SettingsPanel } from '../settings/SettingsPanel'
import { ErrorBanner } from '../error/ErrorBanner'
import { ChatArea } from '../chat/ChatArea'
import { ChatInput } from '../chat/ChatInput'

interface MainAreaProps {
  // Theme
  isDark: boolean
  headerClass: string
  inputAreaClass: string
  
  // Chat state
  currentChat: Chat | undefined
  messages: ChatMessage[]
  prompt: string
  isLoading: boolean
  
  // Settings
  sidebarOpen: boolean
  showSettings: boolean
  selectedModel: string
  availableModels: string[]
  ollamaUrl: string
  error: string
  
  // Event handlers
  onToggleSidebar: () => void
  onRefreshConnection: () => void
  onToggleTheme: () => void
  onToggleSettings: () => void
  onExportChat?: () => void
  onClearChat?: () => void
  onUrlChange: (url: string) => void
  onModelChange: (model: string) => void
  onPromptChange: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  onSuggestionClick: (suggestion: string) => void
}

export const MainArea: React.FC<MainAreaProps> = ({
  isDark,
  headerClass,
  inputAreaClass,
  currentChat,
  messages,
  prompt,
  isLoading,
  sidebarOpen,
  showSettings,
  selectedModel,
  availableModels,
  ollamaUrl,
  error,
  onToggleSidebar,
  onRefreshConnection,
  onToggleTheme,
  onToggleSettings,
  onExportChat,
  onClearChat,
  onUrlChange,
  onModelChange,
  onPromptChange,
  onSend,
  onKeyPress,
  onSuggestionClick
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <Header
        isDark={isDark}
        currentChat={currentChat}
        selectedModel={selectedModel}
        sidebarOpen={sidebarOpen}
        messagesLength={messages.length}
        headerClass={headerClass}
        onToggleSidebar={onToggleSidebar}
        onRefreshConnection={onRefreshConnection}
        onToggleTheme={onToggleTheme}
        onToggleSettings={onToggleSettings}
        onExportChat={onExportChat}
        onClearChat={onClearChat}
      />

      {showSettings && (
        <SettingsPanel
          isDark={isDark}
          ollamaUrl={ollamaUrl}
          selectedModel={selectedModel}
          availableModels={availableModels}
          onUrlChange={onUrlChange}
          onModelChange={onModelChange}
        />
      )}

      {error && (
        <ErrorBanner 
          error={error} 
          selectedModel={selectedModel} 
          isDark={isDark} 
        />
      )}

      <ChatArea
        messages={messages}
        isDark={isDark}
        isLoading={isLoading}
        onSuggestionClick={onSuggestionClick}
      />

      <ChatInput
        prompt={prompt}
        isLoading={isLoading}
        isDark={isDark}
        inputAreaClass={inputAreaClass}
        selectedModel={selectedModel}
        messagesLength={messages.length}
        onPromptChange={onPromptChange}
        onSend={onSend}
        onKeyPress={onKeyPress}
      />
    </div>
  )
}
