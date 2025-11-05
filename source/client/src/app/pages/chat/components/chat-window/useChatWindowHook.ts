import { useEffect, useRef } from 'react'

const useChatWindowHook = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [])
  return { messagesEndRef }
}
export default useChatWindowHook