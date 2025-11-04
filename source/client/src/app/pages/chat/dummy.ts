import type { Message, User } from '@/shared/types/chat.type'

const mockMessages: Message[] = [
  { id: 1, sender: 'lanvtn', content: 'Hi', type: 'text', isMe: false, senderName: 'lanvtn' },
  { id: 2, sender: 'quannm', content: 'Hi', type: 'text', isMe: true, senderName: 'quannm' },
  { id: 3, sender: 'lanvtn', content: 'Ok nhe', type: 'text', isMe: false, senderName: 'lanvtn' },
  { id: 4, sender: 'quannm', content: 'Test.csv', type: 'file', isMe: true, senderName: 'quannm' },
  { id: 5, sender: 'lanvtn', content: 'Hello', type: 'text', isMe: false, senderName: 'lanvtn' },
  { id: 6, sender: 'quannm', content: 'globe BB 100d.txt', type: 'file', isMe: true, senderName: 'quannm' }
]

const mockUsers: User[] = [
  { id: 1, username: 'lanvtn', isOnline: true },
  { id: 2, username: 'quannm', isOnline: true },
  { id: 3, username: 'huyenptt', isOnline: false },
  { id: 4, username: 'trucpt', isOnline: true },
  { id: 5, username: 'thachpgv', isOnline: false },
  { id: 6, username: 'nguyenvana', isOnline: true },
  { id: 7, username: 'lethib', isOnline: false }
]

export { mockMessages, mockUsers }