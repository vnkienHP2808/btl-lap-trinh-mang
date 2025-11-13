import type { Status } from './auth.type'

export interface Message {
  id: string
  conversationId: string
  senderId: {
    username: string
    status: Status
    id: string
  }
  content: string
  type: 'text' | 'file' | 'video'
  isMe: boolean
  media: {
    url: string
    mimeType: string
    fileName: string
    originalName: string
    size: number
  }
  timestamp: Date
}

export interface User {
  id: number
  username: string
  isOnline: boolean
}

export interface FileResponse {
  filename: string
  originalName: string
  size: number
  mimetype: string
  url: string
}