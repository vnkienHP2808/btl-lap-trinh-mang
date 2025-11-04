export interface Message {
  id: number
  sender: string
  content: string
  type: 'text' | 'file'
  isMe: boolean
  senderName: string
}

export interface User {
  id: number
  username: string
  isOnline: boolean
}