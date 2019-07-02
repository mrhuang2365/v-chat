import jsCookie from 'js-cookie'

const TokenKey = 'H_TOKEN'
const USER_INFO = 'H_USER_INFO'

export function setCookie(key, value) {
  jsCookie.set(key, value)
}
export function getCookie(key) {
  return jsCookie.get(key)
}
export function removeCookie(key) {
  jsCookie.remove(key)
}

export function getToken () {
  return getCookie(TokenKey)
}

export function setToken (token) {
  // 过期时间1天
  setCookie(TokenKey, token)
}

export function removeToken () {
  removeCookie(TokenKey)
}

export function setUserInfo (value) {
  localStorage.setItem(USER_INFO, JSON.stringify(value))
}
export function getUserInfo () {
  return JSON.parse(localStorage.getItem(USER_INFO) || '{}')
}
