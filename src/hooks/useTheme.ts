import { useState } from 'react'

export const useTheme = () => {
  const [isDark, setIsDark] = useState<boolean>(true)

  const bgClass = isDark ? 'bg-black' : 'bg-white'
  const headerClass = isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-200'
  const sidebarClass = isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
  const inputAreaClass = isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-200'

  const toggleTheme = () => setIsDark(!isDark)

  return {
    isDark,
    bgClass,
    headerClass,
    sidebarClass,
    inputAreaClass,
    toggleTheme
  }
}
