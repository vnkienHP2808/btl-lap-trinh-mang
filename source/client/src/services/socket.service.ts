/* eslint-disable @typescript-eslint/no-explicit-any */
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
      console.log('Connected to Socket.io server')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server')
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

  sendMessage(receiverUsername: string, content: string, type = 'text', media: any = null) {
    console.log('send message')
    return new Promise((resolve, reject) => {
      this.socket?.emit('send-message', { receiverUsername, content, type, media }, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

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

  // Các event liên quan đến gửi file
  sendFileMetadata(metadata: {
    fileId: string
    originalName: string
    size: number
    mimeType: string
    totalChunks: number
    receiverUsername: string
  }) {
    console.log('Tiến hành emit [file-metadata]')
    return new Promise((resolve, reject) => {
      this.socket?.emit('file-metadata', metadata, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  sendFileChunk(chunkData: { fileId: string; chunkIndex: number; totalChunks: number; data: string }) {
    return new Promise((resolve, reject) => {
      this.socket?.emit('file-chunk', chunkData, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  completeFileUpload(data: { fileId: string; receiverUsername: string }) {
    return new Promise((resolve, reject) => {
      this.socket?.emit('file-upload-complete', data, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }
  //========================================================================

  // Các event liên quan đến gửi Video
  sendVideoMetadata(metadata: {
    fileId: string
    originalName: string
    size: number
    mimeType: string
    totalChunks: number
    receiverUsername: string
  }) {
    console.log('Tiến hành emit [video-metadata]')
    return new Promise((resolve, reject) => {
      this.socket?.emit('video-metadata', metadata, (response: any) => {
        if (response?.success) {
          resolve(response)
        } else {
          reject(new Error(response?.error || 'video-metadata failed'))
        }
      })
    })
  }

  sendVideoChunk(chunkData: { fileId: string; chunkIndex: number; totalChunks: number; data: ArrayBuffer | string }) {
    return new Promise((resolve, reject) => {
      this.socket?.emit('video-chunk', chunkData, (response: any) => {
        if (response?.success) {
          resolve(response)
        } else {
          reject(new Error(response?.error || 'video-chunk failed'))
        }
      })
    })
  }

  completeVideoUpload(fileId: string) {
    return new Promise((resolve, reject) => {
      this.socket?.emit('video-upload-complete', { fileId }, (response: any) => {
        if (response?.success) {
          resolve(response)
        } else {
          reject(new Error(response?.error || 'video-upload-complete failed'))
        }
      })
    })
  }
}

export default new SocketService()