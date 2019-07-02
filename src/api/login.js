import http from '../lib/http'

export function AccountLogin(data){
  return http.post('/api/login/signIn', data)
}