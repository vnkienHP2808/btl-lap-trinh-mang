class _StorageService {
  public set(key: string, value: string) {
    localStorage.setItem(key, value)
  }
  public get(key: string) {
    localStorage.getItem(key)
  }
  public clear() {
    localStorage.clear()
  }
  public getAccessTokenFromLS = () => localStorage.getItem('accessToken') || ''

  public getUsernameFromLS = () => localStorage.getItem('userName') || ''

  public getUserIdFromLS = () => localStorage.getItem('userId') || ''
}

const storageService = new _StorageService()

export default storageService
