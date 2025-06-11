import React from 'react'
import { 
  Sidebar as SidebarIcon, 
  Menu, 
  MessageSquare, 
  RefreshCw, 
  Sun, 
  Moon, 
  Settings, 
  Download, 
  Trash2 
} from 'lucide-react'
import { Chat } from '@/types'

interface HeaderProps {
  isDark: boolean
  currentChat: Chat | undefined
  selectedModel: string
  sidebarOpen: boolean
  messagesLength: number
  headerClass: string
  onToggleSidebar: () => void
  onRefreshConnection: () => void
  onToggleTheme: () => void
  onToggleSettings: () => void
  onExportChat?: () => void
  onClearChat?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  currentChat,
  selectedModel,
  sidebarOpen,
  messagesLength,
  headerClass,
  onToggleSidebar,
  onRefreshConnection,
  onToggleTheme,
  onToggleSettings,
  onExportChat,
  onClearChat
}) => {
  return (
    <div className={`relative z-10 flex items-center justify-between px-6 py-4 ${headerClass} border-b`}>
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
        >
          {sidebarOpen ? <SidebarIcon className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
            {currentChat?.title || 'Chat'}
          </h1>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Ollama • {selectedModel} • Local
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onRefreshConnection}
          className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
          title="Refresh connection"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        
        <button
          onClick={onToggleSettings}
          className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
        >
          <Settings className="w-4 h-4" />
        </button>

        {messagesLength > 0 && (
          <>
            <button
              onClick={onExportChat}
              className={`p-2 rounded-md transition-colors hover:${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClearChat}
              className={`p-2 rounded-md transition-colors hover:bg-red-50 text-red-500 hover:text-red-600`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
