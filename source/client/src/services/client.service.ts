import http from '@/shared/services/http.service'
import type { ApiResponse } from '@/shared/types/http.type'
import type { LoginRequest, LoginResponse, RegisterRequest, RequestResponse } from '@/shared/types/auth.type'

class _ClientService {
  async login(payload: LoginRequest) {
    const response = await http.post<ApiResponse<LoginResponse>>('api/user/login', payload)
    return response
  }
  async register(payload: RegisterRequest) {
    const response = await http.post<ApiResponse<RequestResponse>>('api/user/register', payload)
    return response
  }
  async test() {
    const response = await http.get<ApiResponse<null>>('api/user/test')
    return response
  }
}
const clientService = new _ClientService()

export default clientService