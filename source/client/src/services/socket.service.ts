import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
      transports: ['websocket']
    })

    this.socket.on('connect', () => {
      console.log('Socket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  joinConversations(conversationIds: string[]) {
    this.socket?.emit('join-conversations', conversationIds)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMessage(receiverUsername: string, content: string, type = 'text', media: any[] = []) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket?.emit('send-message', { receiverUsername, content, type, media }, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onReceiveMessage(callback: (data: any) => void) {
    this.socket?.on('receive-message', callback)
  }

  onUsersOnline(callback: (data: { userIds: string[] }) => void) {
    this.socket?.on('users:online', callback)
  }

  onUserOnline(callback: (data: { userId: string }) => void) {
    this.socket?.on('user:online', callback)
  }

  onUserOffline(callback: (data: { userId: string }) => void) {
    this.socket?.on('user:offline', callback)
  }

  off(event: string) {
    this.socket?.off(event)
  }
}

export default new SocketService()
