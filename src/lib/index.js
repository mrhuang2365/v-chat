/* eslint-disable class-methods-use-this, no-underscore-dangle,
no-param-reassign, no-undef, no-unused-vars, no-console global-require */
import WsClient from './WsClient'

const debug = require('debug')('js:ws.index')
const EventEmitter = require('eventemitter3')

const wsTimes = 10 * 1000 // 默认10不收到心跳则关闭ws

class WsService {
  constructor () {
    this._runningStatus = false
    this._eventListener = new EventEmitter()
    this._checkHeartBeatTimer = null

    // this.start()
    this._initWsClient()
  }
  /* **************  公有函数  *************** */
  on (name, callback) {
    this._eventListener.on(name, callback)
  }
  removeListener (ev, cb) {
    this._eventListener.removeListener(ev, cb)
  }
  // 开启ws连接
  start () {
    if (!this._runningStatus) {
      this._runningStatus = true
      // 创建ws连接
      debug('WsClient:', WsClient)
      WsClient.start()
      // 定时检测心跳超时
      this._checkHeartBeat()
    }
  }
  // 断开ws连接
  stop () {
    this._runningStatus = false
    WsClient.stop()
    if (this._checkHeartBeatTimer) {
      clearTimeout(this._checkHeartBeatTimer)
      this._checkHeartBeatTimer = null
    }
  }
  /* **************  私有函数  *************** */
  // 定时检测心跳超时
  _checkHeartBeat () {
    if (this._checkHeartBeatTimer) {
      clearTimeout(this._checkHeartBeatTimer)
    }
    this._checkHeartBeatTimer = setTimeout(() => {
      debug('CheckHeartBeat Timeout')
      WsClient.close()
    }, wsTimes)
  }
  // 响应ws消息
  _initWsClient () {
    // 应答心跳
    WsClient.on('heartbeat', (event) => {
      debug('heartbeat', event.data.beat)
      event.replyEvent({
        beat: event.data.beat
      })
      this._checkHeartBeat()
    })
    // 重连
    WsClient.on('open', () => {
      this._eventListener.emit('open', {})
    })
  }
}

export default new WsService()
