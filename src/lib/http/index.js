/**
 * 前端统一Http请求接口
 * 自动带token请求
 */
const debug = require('debug')('@httpApi')

class HttpApi {
  constructor (host) {
    this.HOST = host || location.origin
  }
  async post (path, data) {
    const url = `${this.HOST}${path}`
    const token = `MRHUANG ${localStorage.token}`
    debug('======url, data', url, data)
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      method: 'POST',
      body: JSON.stringify(data)
    })
    if (response.ok) {
      return response.json()
    }

    const text = await response.text()
    throw new Error(`HTTP API Fail: ${response.status} , ${text}`)
  }
  async get (path) {
    const url = `${this.HOST}${path}`
    debug('======url, data', url)
    const response = await fetch(url, {
      method: 'GET'
    })
    if (response.ok) {
      return response.text()
    }

    const text = await response.text()
    throw new Error(`HTTP API Fail: ${response.status} , ${text}`)
  }
  /**
   * 更新token信息
   * @param {*} newToken
   */
  setToken (newToken) {
    localStorage.token = newToken
  }
}

export default new HttpApi()
