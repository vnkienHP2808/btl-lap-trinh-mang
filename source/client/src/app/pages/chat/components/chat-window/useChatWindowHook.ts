import clientService from '@/services/client.service'
import socketService from '@/services/socket.service'
import useNotificationHook from '@/shared/hook/useNotificationHook'
import type { Message } from '@/shared/types/chat.type'
import { HTTP_STATUS } from '@/shared/types/http.type'
import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'

export interface MessageWithIsMe extends Message {
  isMe: boolean
}

const useChatWindowHook = () => {
  const { conversationId } = useParams<{ conversationId: string }>()
  const location = useLocation()
  const { username: receiverUsername, userId: receiverId, status } = location.state || {}

  const [messages, setMessages] = useState<MessageWithIsMe[]>([])
  const [inputValue, setInputValue] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { showError, showSuccess } = useNotificationHook()

  const currentUsername = localStorage.getItem('userName')

  // Load messages
  const loadMessages = async () => {
    if (!conversationId) return

    try {
      setLoading(true)
      const response = await clientService.getAllMessageOfConversation(conversationId)
      if (response.status === 200) {
        const messagesData = response.data.data.map((msg: Message) => {
          return {
            ...msg,
            isMe: msg.senderId.username === currentUsername
          }
        })
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Kiểm tra kích thước file
    if (file.size > 10 * 1024 * 1024) {
      showError('File không được vượt quá 10MB')
      return
    }

    try {
      setUploadingFile(true)

      // 1. Upload file qua HTTP
      const formData = new FormData()
      formData.append('file', file)

      const response = await clientService.uploadFile(formData)
      console.log(response.data)
      if (response.status !== HTTP_STATUS.OK) {
        console.log(`response ${response.data}`)
        throw new Error('Upload file thất bại')
      }

      console.log(`response 1 ${response.data}`)

      const result = response.data.data

      // 2. Gửi thông tin file qua WebSocket
      await socketService.sendMessage(
        receiverUsername,
        file.name, // Tên file làm content
        'file', // type = 'file'
        {
          fileName: result.filename,
          originalName: result.originalName,
          size: result.size,
          mimeType: result.mimetype,
          url: result.url
        }
      )

      // Reset input file
      e.target.value = ''
      showSuccess('Gửi file thành công')
    } catch (error) {
      showError('Không thể gửi file')
      console.error('Error uploading file:', error)
    } finally {
      setUploadingFile(false)
    }
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
    console.log(e)
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('ok')
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
    handleKeyPress,
    handleFileSelect,
    uploadingFile,
    setUploadingFile
  }
}

export default useChatWindowHook