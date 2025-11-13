import http from '@/shared/services/http.service'
import type { GetListUserResponse } from '@/shared/types/auth.type'
import type { ApiResponse } from '@/shared/types/http.type'

class ConversationService {
  async findOrCreateConversation({ username }: { username: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await http.post<ApiResponse<any>>('api/conversations/find-or-create', {
      username: username
    })
    return response
  }
  async getListUser() {
    const response = await http.get<ApiResponse<GetListUserResponse[]>>('api/conversations/users')
    return response
  }
}

export default new ConversationService()
