import React from 'react'
import { MessageSquare } from 'lucide-react'
import { SUGGESTIONS } from '@/constants'

interface EmptyStateProps {
  isDark: boolean
  onSuggestionClick: (suggestion: string) => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isDark, onSuggestionClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
        <MessageSquare className="w-6 h-6" />
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
        Start a conversation
      </h3>
      <p className={`text-center max-w-md ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
        Ask questions, get help with code, brainstorm ideas, or just have a conversation with your local Ollama model.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full max-w-lg">
        {SUGGESTIONS.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(suggestion)}
            className={`p-3 text-left text-sm rounded-lg border transition-colors ${
              isDark 
                ? 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50 text-neutral-300' 
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700'
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
