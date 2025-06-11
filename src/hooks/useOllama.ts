import { useState, useCallback } from 'react'
import { DEFAULT_MODELS, DEFAULT_OLLAMA_URL } from '@/constants'

export const useOllama = () => {
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2')
  const [availableModels, setAvailableModels] = useState<string[]>(DEFAULT_MODELS)
  const [ollamaUrl, setOllamaUrl] = useState<string>(DEFAULT_OLLAMA_URL)
  const [error, setError] = useState<string>('')

  const checkOllamaConnection = useCallback(async () => {
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`)
      if (response.ok) {
        const data = await response.json()
        const modelNames = data.models?.map((model: { name: string }) => model.name) || []
        if (modelNames.length > 0) {
          setAvailableModels(modelNames)
          if (!modelNames.includes(selectedModel)) {
            setSelectedModel(modelNames[0])
          }
        }
        setError('')
      }
    } catch (err) {
      console.log('Ollama connection check failed:', err)
    }
  }, [ollamaUrl, selectedModel])

  return {
    selectedModel,
    setSelectedModel,
    availableModels,
    setAvailableModels,
    ollamaUrl,
    setOllamaUrl,
    error,
    setError,
    checkOllamaConnection
  }
}
