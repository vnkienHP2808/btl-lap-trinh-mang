import http from '@/shared/services/http.service'
import type { ApiResponse } from '@/shared/types/http.type'
import type {
  GetListUserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RequestResponse
} from '@/shared/types/auth.type'
import storageService from '@/shared/services/storage.service'
import type { Message } from '@/shared/types/chat.type'

class _ClientService {
  async login(payload: LoginRequest) {
    const response = await http.post<ApiResponse<LoginResponse>>('api/user/login', payload)
    return response
  }

  async register(payload: RegisterRequest) {
    const response = await http.post<ApiResponse<RequestResponse>>('api/user/register', payload)
    return response
  }

  async getAllMessageOfConversation(conversationId: string) {
    const response = await http.get<ApiResponse<Message[]>>(`api/message/${conversationId}`)
    return response
  }

  async test() {
    const response = await http.get<ApiResponse<null>>('api/user/test')
    return response
  }

  async getCurrentUserName() {
    return storageService.getUsernameFromLS()
  }
}

export default new _ClientService()
