import clientService from '@/services/client.service'
import socketService from '@/services/socket.service'
import useNotificationHook from '@/shared/hook/useNotificationHook'
import type { Message } from '@/shared/types/chat.type'
import { readChunkAsBase64 } from '@/shared/utils/readChunkAsBase64'
import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'

const isVideoFile = (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const videoExts = ['mp4', 'mov', 'mkv', 'webm', 'avi']

  return file.type.startsWith('video/') || (ext ? videoExts.includes(ext) : false)
}

const useChatWindowHook = () => {
  const { conversationId } = useParams<{ conversationId: string }>()
  const location = useLocation()
  const { username: receiverUsername, userId: receiverId, status } = location.state || {}
  const CHUNK_SIZE = 64 * 1024 // 64KB mỗi chunk
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { showError } = useNotificationHook()

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
            ...msg
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
    loadMessages()
    socketService.onReceiveMessage(({ message, conversationId: msgConvId }) => {
      console.log('lắng nghe sự kiện nhận tin nhăn')
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

    const video = isVideoFile(file)

    // Giới hạn dung lượng
    if (video) {
      if (file.size > 50 * 1024 * 1024) {
        showError('Video không được vượt quá 50MB')
        return
      }
    } else {
      if (file.size > 10 * 1024 * 1024) {
        showError('File không được vượt quá 10MB')
        return
      }
    }

    if (!receiverUsername) {
      showError('Vui lòng chọn người nhận')
      return
    }

    try {
      setUploadingFile(true)

      // tạo id + tính số chunk dùng chung cho cả file & video
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

      console.log(video ? 'Bắt đầu upload VIDEO' : 'Bắt đầu upload FILE')
      console.log('- File ID:', fileId)
      console.log('- Size:', file.size)
      console.log('- Total chunks:', totalChunks)

      if (video) {
        // ================== LUỒNG VIDEO ==================
        // 1. metadata
        await socketService.sendVideoMetadata({
          fileId,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          totalChunks,
          receiverUsername
        })

        // 2. từng chunk (gửi dạng ArrayBuffer)
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE
          const end = Math.min(start + CHUNK_SIZE, file.size)
          const chunk = file.slice(start, end)

          const arrayBuffer = await chunk.arrayBuffer()

          await socketService.sendVideoChunk({
            fileId,
            chunkIndex,
            totalChunks,
            data: arrayBuffer
          })

          console.log(`Gửi chunk VIDEO ${chunkIndex + 1}/${totalChunks}`)
        }

        // 3. complete (video-upload-complete chỉ cần fileId)
        await socketService.completeVideoUpload(fileId)
      } else {
        // ================== LUỒNG FILE (đang dùng) ==================
        // 1. metadata
        await socketService.sendFileMetadata({
          fileId,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          totalChunks,
          receiverUsername
        })

        // 2. từng chunk (đọc base64 + gửi file-chunk)
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE
          const end = Math.min(start + CHUNK_SIZE, file.size)
          const chunk = file.slice(start, end)

          const base64Chunk = await readChunkAsBase64(chunk)

          await socketService.sendFileChunk({
            fileId,
            chunkIndex,
            totalChunks,
            data: base64Chunk
          })

          console.log(`Gửi chunk FILE ${chunkIndex + 1}/${totalChunks}`)
        }

        // 3. complete
        await socketService.completeFileUpload({
          fileId,
          receiverUsername
        })
      }

      // reset input
      e.target.value = ''
    } catch (error) {
      showError(video ? 'Không thể gửi video' : 'Không thể gửi file')
      console.error(error)
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
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
    uploadingFile,
    handleInputChange,
    handleSend,
    handleKeyPress,
    handleFileSelect,
    setUploadingFile
  }
}

export default useChatWindowHook
