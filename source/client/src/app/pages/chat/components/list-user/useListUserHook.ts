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
  const navigate = useNavigate()
  const { showError, showSuccess } = useNotificationHook()

  // Lấy danh sách users
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

  // Kết nối socket và lắng nghe sự kiện
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate('/login')
      return
    }

    socketService.connect(token)

    socketService.onUsersOnline(({ userIds }) => {
      setOnlineUsers(userIds)
    })

    socketService.onUserOnline(({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])])
    })

    socketService.onUserOffline(({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    })

    getListUser()

    return () => {
      socketService.disconnect()
    }
  }, [])

  // Cập nhật trạng thái user dựa trên sự kiện socket
  useEffect(() => {
    setListUser((prevUsers) =>
      prevUsers.map((user) => ({
        ...user,
        status: onlineUsers.includes(user.id) ? Status.ONLINE : Status.OFFLINE
      }))
    )
  }, [onlineUsers])

  // Xử lý sự kiện chọn User
  const handleSelectUser = async (user: GetListUserResponse) => {
    try {
      console.log(`username: ${user.username}`)
      setSelectedUserId(user.id)

      // Tìm hoặc tạo conversation
      const response = await conversationService.findOrCreateConversation({ username: user.username })
      if (response.status === 200) {
        const conversationId = response.data.data._id

        // Tham gia cuộc trò chuyện
        socketService.joinConversations([conversationId])

        // điều hướng đến chat với conversationId và username
        navigate(`/chat/${conversationId}`, {
          state: {
            username: user.username,
            userId: user.id,
            status: user.status
          }
        })
      }
    } catch {
      showError('Không thể tạo cuộc trò chuyện')
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
