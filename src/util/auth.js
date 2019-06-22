import jsCookie from 'js-cookie'

const TokenKey = 'H_TOKEN'
const USER_INFO = 'H_USER_INFO'

export function getToken () {
  return jsCookie.get(TokenKey)
}

export function setToken (token) {
  return jsCookie.set(TokenKey, token)
}

export function removeToken () {
  return jsCookie.remove(TokenKey)
}

export function setUserInfo (value) {
  localStorage.setItem(USER_INFO, JSON.stringify(value))
}
export function getUserInfo () {
  return JSON.parse(localStorage.getItem(USER_INFO) || '{}')
}
