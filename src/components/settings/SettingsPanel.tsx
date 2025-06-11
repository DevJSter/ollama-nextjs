import React from 'react'
import { Zap } from 'lucide-react'

interface SettingsPanelProps {
  isDark: boolean
  ollamaUrl: string
  selectedModel: string
  availableModels: string[]
  onUrlChange: (url: string) => void
  onModelChange: (model: string) => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isDark,
  ollamaUrl,
  selectedModel,
  availableModels,
  onUrlChange,
  onModelChange
}) => {
  return (
    <div className={`relative z-10 px-6 py-4 ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'} border-b`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>
              Model Configuration
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Ollama URL
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-md border ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-700 text-white' 
                  : 'bg-white border-neutral-300 text-black'
              }`}
              placeholder="http://localhost:11434"
            />
          </div>
          
          <div>
            <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-md border ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-700 text-white' 
                  : 'bg-white border-neutral-300 text-black'
              }`}
            >
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
