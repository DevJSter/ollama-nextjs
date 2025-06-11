import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorBannerProps {
  error: string
  selectedModel: string
  isDark: boolean
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, selectedModel, isDark }) => {
  return (
    <div className={`relative z-10 mx-6 mt-4 p-4 border rounded-lg ${isDark ? 'bg-red-950/50 border-red-900/50' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className={`font-medium text-sm ${isDark ? 'text-red-400' : 'text-red-800'}`}>
            Connection Error
          </div>
          <div className={`text-sm mt-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
            {error}
          </div>
          <div className={`text-xs mt-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            Troubleshooting:
            <br />• Ensure Ollama is running: <code className={`px-1 py-0.5 rounded text-xs ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>ollama serve</code>
            <br />• Check if model exists: <code className={`px-1 py-0.5 rounded text-xs ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>ollama list</code>
            <br />• Pull model if needed: <code className={`px-1 py-0.5 rounded text-xs ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>ollama pull {selectedModel}</code>
          </div>
        </div>
      </div>
    </div>
  )
}
