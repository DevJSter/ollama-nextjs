import React from 'react'
import { Plus } from 'lucide-react'

interface SidebarHeaderProps {
  isDark: boolean
  onNewChat: () => void
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isDark, onNewChat }) => {
  return (
    <div className="p-4 border-b border-neutral-800">
      <button
        onClick={onNewChat}
        className={`w-full p-3 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${
          isDark 
            ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-900/50 text-neutral-300' 
            : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100 text-neutral-700'
        }`}
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">New Chat</span>
      </button>
    </div>
  )
}
