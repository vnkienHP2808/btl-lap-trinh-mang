/* eslint-disable @typescript-eslint/no-explicit-any */
import conversationService from '@/services/conversation.service'
import socketService from '@/services/socket.service'
import useNotificationHook from '@/shared/hook/useNotificationHook'
import { Status } from '@/shared/types/auth.type'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface GetListUserResponse {
  id: string
  username: string
  status: Status
  createdAt: Date
  lastSeen?: Date
}

const useListUserHook = () => {
  const [listUser, setListUser] = useState<GetListUserResponse[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const { showError, showSuccess } = useNotificationHook()
  const navigate = useNavigate()

  const getListUser = async () => {
    try {
      const response = await conversationService.getListUser()
      if (response.status === 200) {
        const users = response.data.data.map((u: any) => ({
          id: u._id,
          username: u.username,
          status: u.status,
          lastSeen: u.lastSeen ? new Date(u.lastSeen) : undefined,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date()
        }))
        setListUser(users)
      }
    } catch {
      showError('Không thể tải danh sách người dùng')
    }
  }

  // Setup socket listeners
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate('/login')
      return
    }

    // Connect socket
    socketService.connect(token)

    // Listen online users
    socketService.onUsersOnline(({ userIds }) => {
      setOnlineUsers(userIds)
    })

    socketService.onUserOnline(({ userId }) => {
      getListUser()
      setOnlineUsers((prev) => [...new Set([...prev, userId])])
    })

    socketService.onUserOffline(({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    })

    // Load users
    getListUser()

    return () => {
      socketService.disconnect()
    }
  }, [])

  // Update user status based on socket events
  useEffect(() => {
    setListUser((prevUsers) =>
      prevUsers.map((user) => ({
        ...user,
        status: onlineUsers.includes(user.id) ? Status.ONLINE : Status.OFFLINE
      }))
    )
  }, [onlineUsers])

  // Handle select user
  const handleSelectUser = async (user: GetListUserResponse) => {
    try {
      console.log(`username: ${user.username}`)
      setSelectedUserId(user.id)

      // Tìm hoặc tạo conversation
      const response = await conversationService.findOrCreateConversation({ username: user.username })
      console.log('Response::', response)
      if (response.status === 200) {
        const conversationId = response.data.data._id
        console.log('conversationId::::', conversationId)

        // Join conversation room
        socketService.joinConversations([conversationId])

        // Navigate to chat với conversationId và username
        navigate(`/chat/${conversationId}`, {
          state: {
            username: user.username,
            userId: user.id,
            status: user.status
          }
        })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showError(error.response?.data?.error || 'Không thể tạo cuộc trò chuyện')
      console.error('Error creating conversation:', error)
    }
  }

  return {
    listUser,
    selectedUserId,
    onlineUsers,
    handleSelectUser,
    showError,
    showSuccess
  }
}

export default useListUserHook