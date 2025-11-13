export enum Status {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  user_info: {
    id: string
    username: string
    status: Status
    lastSeen: Date
  }
}

interface RegisterRequest {
  username: string
  password: string
  confirm_password: string
}

interface RequestResponse {
  id: string
  username: string
}

interface GetListUserResponse {
  id: string
  username: string
  status: Status
  createdAt: Date
}

export type { LoginRequest, LoginResponse, RegisterRequest, RequestResponse, GetListUserResponse }
