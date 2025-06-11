import React, { useState } from 'react'
import { Edit3, Trash2, Check, X } from 'lucide-react'
import { Chat } from '@/types'

interface ChatItemProps {
  chat: Chat
  isActive: boolean
  isDark: boolean
  onSelect: () => void
  onDelete: () => void
  onUpdateTitle: (newTitle: string) => void
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  isActive,
  isDark,
  onSelect,
  onDelete,
  onUpdateTitle
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editingTitle, setEditingTitle] = useState('')

  const startEditing = () => {
    setIsEditing(true)
    setEditingTitle(chat.title)
  }

  const saveTitle = () => {
    onUpdateTitle(editingTitle)
    setIsEditing(false)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditingTitle('')
  }

  return (
    <div
      className={`group p-3 rounded-lg cursor-pointer transition-colors relative ${
        isActive
          ? (isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black')
          : (isDark ? 'hover:bg-neutral-900/50 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700')
      }`}
      onClick={onSelect}
    >
      {isEditing ? (
        <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className={`flex-1 bg-transparent border-none outline-none text-sm ${
              isDark ? 'text-white' : 'text-black'
            }`}
            onKeyPress={(e) => e.key === 'Enter' && saveTitle()}
            autoFocus
          />
          <button
            onClick={saveTitle}
            className="p-1 rounded text-green-500 hover:bg-green-500/20"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={cancelEditing}
            className="p-1 rounded text-red-500 hover:bg-red-500/20"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate pr-2">
              {chat.title}
            </span>
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  startEditing()
                }}
                className={`p-1 rounded transition-colors ${
                  isDark ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-300 text-neutral-600'
                }`}
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 rounded transition-colors hover:bg-red-500/20 text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
            {chat.messages.length} messages
          </div>
        </>
      )}
    </div>
  )
}
