import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { HTTP_STATUS, type ApiResponse } from '../types/http.type'
import type { LoginResponse } from '../types/auth.type'
import storageService from './storage.service'

class _Http {
  private readonly instance: AxiosInstance
  private access_token: string
  private username: string
  private id: string
  constructor() {
    this.access_token = storageService.getAccessTokenFromLS()
    this.username = storageService.getUsernameFromLS()
    this.id = storageService.getUserIdFromLS()
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.access_token && config.headers) {
          config.headers.authorization = `Bearer ${this.access_token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { url } = response.config
        if (url === 'api/user/login' && response.status === HTTP_STATUS.OK) {
          const data = response.data as ApiResponse<LoginResponse>
          // lấy ra username, token, id lưu vào LS
          this.username = data.data!.user_info.username
          this.access_token = data.data!.access_token
          this.id = data.data!.user_info.id
          console.log(data)
          storageService.set('accessToken', this.access_token)
          storageService.set('userName', this.username)
          storageService.set('userId', this.id)
        }
        return response
      },
      (error) => {
        console.log('Interceptor bắt lỗi:', error.response?.status, error.config?.url)
        console.log('error', error)
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED || error.response?.status === HTTP_STATUS.FORBIDDEN) {
          storageService.clear()
        }
        return Promise.reject(error)
      }
    )
  }
  /**
   * @param T: định nghĩa kiểu mà API sẽ trả về ( xem ví dụ)
   * @param url: đường dãn API
   * @param config
   * @return
   * Ví dụ sử dụng
   * const response = await http.get<ApiResponse<User[]>>('/users')
   * =============================================================
   * @description: API Login:
   * interface LoginRequest {
   *     username: string
   *     password: string
   * }
   * interface LoginResponse {
   *    message: string
   *    user: User
   *    accessToken: string
   *    refreshToken: string
   * }
   * credentials: LoginRequest
   * const response = await http.post<ApiResponse<LoginResponse>>('/auth/login',credentials)
   * ==============================================================
   * @description: API tạo mới
   * interface CreateUserRequest {
   *  username: string
   *  email: string
   *  password: string
   *  fullName: string
   * }
   * userData: CreateUserRequest
   * const response = await http.post<ApiResponse<User>>(/users', userData)
   * ==============================================================
   * @description: Trường hợp sử dụng biến Config truyền vào
   * const config: AxiosRequestConfig = {
   *    headers: {
   *        'Authorization': `Bearer ${token}`,
   *        'X-Custom-Header': 'some-value'
   *    }
   *  }
   * const response = await http.get<ApiResponse<User>>('/user/profile', config)
   */

  get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config)
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, {
      ...config,
      validateStatus: (status) => status >= 200 && status < 500
    })
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config)
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config)
  }

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config)
  }
}

const http = new _Http()

export default http
