import { useState, useCallback } from 'react'
import { ChatMessage, OllamaResponseChunk } from '@/types'
import { generateId } from '@/utils'

type UseChatOptions = {
  ollamaUrl: string
  selectedModel: string
  setError: (error: string) => void
  updateCurrentChat: (messages: ChatMessage[]) => void
}

export const useChat = ({ ollamaUrl, selectedModel, setError, updateCurrentChat }: UseChatOptions) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleStreamResponse = useCallback(async (response: Response, initialMessages: ChatMessage[]) => {
    if (!response.body) {
      throw new Error('No response body received')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let botContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(Boolean)

      for (const line of lines) {
        try {
          const data: OllamaResponseChunk = JSON.parse(line)
          
          if (data.error) {
            throw new Error(data.error)
          }
          
          if (data.done) continue

          // Handle both generate and chat API responses
          const content = (data as OllamaResponseChunk & { response?: string }).response || data.message?.content || ''
          if (content) {
            botContent += content
            const updatedMessages = [...initialMessages]
            updatedMessages[updatedMessages.length - 1] = {
              ...updatedMessages[updatedMessages.length - 1],
              content: botContent,
            }
            updateCurrentChat(updatedMessages)
          }
        } catch (parseError) {
          console.error('Error parsing stream chunk:', parseError)
        }
      }
    }
  }, [updateCurrentChat])

  const sendMessage = useCallback(async (prompt: string, messages: ChatMessage[], currentChatId: string | null) => {
    console.log('sendMessage called with:', { prompt, messagesCount: messages.length, currentChatId })
    
    if (!prompt.trim() || isLoading || !currentChatId) {
      console.log('sendMessage early return:', { promptEmpty: !prompt.trim(), isLoading, noChatId: !currentChatId })
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt.trim(),
      timestamp: new Date(),
      id: generateId()
    }

    const currentMessages = [...messages, userMessage]
    updateCurrentChat(currentMessages)
    setIsLoading(true)
    setError('')

    console.log('Starting message send process...')

    try {
      const botMessage: ChatMessage = {
        role: 'bot',
        content: '',
        timestamp: new Date(),
        id: generateId()
      }
      
      const messagesWithBot = [...currentMessages, botMessage]
      updateCurrentChat(messagesWithBot)

      // Prepare conversation history for context
      const conversationHistory = currentMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      // Try chat endpoint first (supports conversation history)
      let response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          stream: true,
          messages: conversationHistory,
        }),
      })

      if (!response.ok) {
        // Fallback to generate endpoint with context as a single prompt
        const contextPrompt = conversationHistory
          .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
          .join('\n\n') + '\n\nAssistant:'

        response = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: contextPrompt,
            stream: true,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}. Try checking if the model '${selectedModel}' is available.`)
        }
      }

      await handleStreamResponse(response, messagesWithBot)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Chat error:', err)
      
      // Remove the empty bot message on error
      updateCurrentChat(currentMessages)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, ollamaUrl, selectedModel, setError, updateCurrentChat, handleStreamResponse])

  return {
    isLoading,
    sendMessage
  }
}
