import { useEffect } from 'react'
import { loadChatsFromCache } from '@/utils'
import { Chat } from '@/types'

type UseInitializationOptions = {
  setChats: (chats: Chat[]) => void
  setCurrentChatId: (id: string) => void
  checkOllamaConnection: () => void
}

export const useInitialization = ({ setChats, setCurrentChatId, checkOllamaConnection }: UseInitializationOptions) => {
  useEffect(() => {
    checkOllamaConnection()
    
    const cachedChats = loadChatsFromCache()
    setChats(cachedChats)
    
    // Set the most recent chat as current
    if (cachedChats.length > 0) {
      const mostRecent = cachedChats.sort((a, b) => 
        b.updatedAt.getTime() - a.updatedAt.getTime()
      )[0]
      setCurrentChatId(mostRecent.id)
    }
  }, [setChats, setCurrentChatId, checkOllamaConnection])
}
