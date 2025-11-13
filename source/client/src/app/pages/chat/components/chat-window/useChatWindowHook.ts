import clientService from '@/services/client.service'
import socketService from '@/services/socket.service'
import useNotificationHook from '@/shared/hook/useNotificationHook'
import type { Message } from '@/shared/types/chat.type'
import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'

interface MessageWithIsMe extends Message {
  isMe: boolean
}

const useChatWindowHook = () => {
  const { conversationId } = useParams<{ conversationId: string }>() // cái này hiện tại là id của thằng nhận nhưng lại đang nhầm là id conversation.
  // giờ sửa lại. Từ
  const location = useLocation()
  const { username: receiverUsername, userId: receiverId, status } = location.state || {}

  const [messages, setMessages] = useState<MessageWithIsMe[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { showError } = useNotificationHook()

  const currentUsername = localStorage.getItem('username')

  // Load messages
  const loadMessages = async () => {
    if (!conversationId) return

    try {
      setLoading(true)
      console.log(`api/messages/${conversationId}`)
      const response = await clientService.getAllMessageOfConversation(conversationId)
      console.log('response chat window:::', response)
      if (response.status === 200) {
        const messagesData = response.data.data.map((msg: Message) => ({
          ...msg,
          isMe: msg.senderName === currentUsername
        }))
        setMessages(messagesData)
      }
    } catch (error) {
      showError('Không thể tải tin nhắn')
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // Setup socket listeners
  useEffect(() => {
    if (!conversationId) return

    // Load messages
    loadMessages()

    // Listen for new messages
    socketService.onReceiveMessage(({ message, conversationId: msgConvId }) => {
      if (msgConvId === conversationId) {
        setMessages((prev) => {
          // Tránh duplicate
          if (prev.some((m) => m.id === message._id)) {
            return prev
          }
          return [
            ...prev,
            {
              ...message,
              isMe: message.senderId.username === currentUsername
            }
          ]
        })
      }
    })

    return () => {
      socketService.off('receive-message')
    }
  }, [conversationId])

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleSend = async () => {
    if (!inputValue.trim() || !receiverUsername) return

    try {
      await socketService.sendMessage(receiverUsername, inputValue.trim())
      setInputValue('')
    } catch (error) {
      showError('Không thể gửi tin nhắn')
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return {
    messages,
    inputValue,
    loading,
    receiverUsername,
    receiverId,
    status,
    messagesEndRef,
    handleInputChange,
    handleSend,
    handleKeyPress
  }
}

export default useChatWindowHook
