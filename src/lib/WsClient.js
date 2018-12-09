/* eslint-disable class-methods-use-this, no-underscore-dangle,
no-param-reassign, no-undef, no-unused-vars, no-console global-require */
/**
 * 创建到服务器的Websocket连接
 * 连接对象
 */
const debug = require('debug')('js:wsClient')
const _ = require('lodash')
const EE = require('eventemitter3')

debug('START WS Client1')
const SEND_EVENT_TIMEOUT = 10000 // 发送超时时间
/**
 * Event对象
 * @param wsConn
 * @param eventJson
 * @private
 */
class WsEvent {
  constructor (wsConn, eventJson) {
    this.conn = wsConn
    this.id = eventJson.id
    this.name = eventJson.event.name
    this.data = eventJson.event.data
  }
  replyEvent (data) {
    const replyData = {
      reply: {
        name: this.name,
        data
      },
      id: this.id
    }
    this.conn.send(JSON.stringify(replyData))
  }
  replyError (err) {
    const replyData = {
      reply: {
        name: this.name,
        err
      },
      id: this.id
    }
    this.conn.send(JSON.stringify(replyData))
  }
}

// 创建到服务器连接
class WsClient {
  constructor () {
    this._ws = null
    this._wsServerAddr = 'ws://localhost:3000'
    this._mac = ''
    // 接收事件监听器，使用on注册
    this._eventListener = new EE()
    this._sendTrackEventId = 0 // 发送Id计数
    this._sendEventTracker = {} // 发送队列
    // 启动连接、检测
    this._runningStatus = false
    this._inter_checkSendTimeout = null
    this._inter_loadConfig = null
    this._inter_checkWsStatus = null
    this._timer_reConnect = null
  }
  /* *********************  公有函数  ********************************** */
  on (name, callback) {
    this._eventListener.on(name, callback)
  }
  close () {
    if (this._ws) {
      this._ws.close()
    }
  }
  // 创建连接，开启定时检测
  start (curMac) {
    if (!this._runningStatus) {
      this._mac = curMac
      this._runningStatus = true
      // 创建ws连接
      this._connectToServer(1)
      // 定时检测ws状态
      this._statusErrCount = 0
      this._checkWsStatus()
      // 检测发送超时
      this._inter_checkSendTimeout = setInterval(() => {
        this._doCheckSendTimeout()
      }, 2000)
    }
  }
  // 停止重连
  stop () {
    this._runningStatus = false
    // 检测发送超时
    if (this._inter_checkSendTimeout) {
      clearInterval(this._inter_checkSendTimeout)
      this._inter_checkSendTimeout = null
    }
    // 检测配置文件改变
    if (this._inter_loadConfig) {
      clearInterval(this._inter_loadConfig)
      this._inter_loadConfig = null
    }
    // 定时检测ws状态
    if (this._inter_checkWsStatus) {
      clearInterval(this._inter_checkWsStatus)
      this._inter_checkWsStatus = null
    }
    if (this._timer_reConnect) {
      clearTimeout(this._timer_reConnect)
      this._timer_reConnect = null
    }
    // 断开连接
    this.close()
  }
  /* *********************  私有函数  ********************************** */
  _connectToServer (n) {
    debug('=======================conn', n)
    this._statusErrCount = 0
    this._ws = new WebSocket(this._wsServerAddr, 'ws.event')
    debug(`connect to ws server:${this._wsServerAddr}`)

    this._ws.onerror = (err) => {
      debug(`websocket error: ${err.code}, ${err.address}:${err.port}`)
      this._ws.close()
    }

    this._ws.onclose = (code, reason) => {
      debug(`Websocket Connected Closed: ${code}, ${reason}`)
    }

    this._ws.onopen = () => {
      // 发送本机mac
      this._send('wsOpen', {
        mac: this._mac
      }, (err, event) => {
        debug('Websocket Connected Successed!', err, event)
        if (!err) {
          this._eventListener.emit('open')
        }
      })
    }

    this._ws.onmessage = (data) => {
      // debug('onmessage', data.data, typeof data.data)
      // 根据注册的监听消息，响应事件，事件为标准JSON格式，并为标准应答模式
      let json = {}
      try {
        json = JSON.parse(data.data)
      } catch (e) {
        this._ws.close(4000, 'INVALID Message Format')
        return
      }

      // 接收到客户端发送消息
      if (_.isPlainObject(json.event) && _.isString(json.event.name)) {
        const event = new WsEvent(this._ws, json)
        this._onRecvedEvent(event)
      } else if (_.isPlainObject(json.reply)) {
        // const event = new WsEvent(this._ws, json)
        this._onRecvedReply(json)
      } else {
        debug('client Websocket Invalid Message Type:', json)
        this._ws.close(4000, 'INVALID Message Type')
      }
    }
  }
  // 定时检测ws连接状态
  _checkWsStatus () {
    this._inter_checkWsStatus = setInterval(() => {
      if (this._ws && (this._ws.readyState === 0)) {
        this._statusErrCount += 1
      }
      if (this._statusErrCount > 3) {
        this._ws.close()
        this._statusErrCount = 0
        return
      }
      // 判断ws连接是否正常 0 connecting 1 open 2 closing 3 closed
      if (this._ws && (this._ws.readyState > 1)) {
        debug('=============readyState', this._ws.readyState)
        debug('=============_wsServerAddr', this._wsServerAddr)
        // 防止ws正在重连
        // if (this._timer_reConnect) clearTimeout(this._timer_reConnect)
        this._timer_reConnect = setTimeout(() => {
          if (this._ws && (this._ws.readyState > 1)) {
            this._connectToServer(4)
          }
        }, 1000)
      }
    }, 8000)
  }
  // 定时检测sendMsg超时
  _doCheckSendTimeout () {
    const now = _.now()
    _.forEach(this._sendEventTracker, (v, k) => {
      if ((now - v.at) > SEND_EVENT_TIMEOUT) {
        debug('Websocket Wait Reply Event TIME OUT:', k, v.event.event.name)
        delete this._sendEventTracker[k]
        // 直接关闭连接
        this._ws.close(4000, `client wait reply Timeout: ${v.event.event.name}`)
        v.callback(new Error('Event Timeout'), {})
      }
    })
  }
  // 转发收到的msg
  _onRecvedEvent (event) {
    if (!this._eventListener.emit(event.name, event)) {
      // 未注册监听
      this._ws.close(4000, `client unregistered Event: ${event.name}`)
    }
  }
  // 收到reply，清除对应的send
  _onRecvedReply (event) {
    // 查找已经注册的发送消息，执行发送回调消息
    const sendTrack = this._sendEventTracker[event.id]
    const replyEvent = {
      id: event.id,
      name: event.reply.name,
      data: event.reply.data,
      duration: _.now() - sendTrack.at
    }
    if (sendTrack) {
      if (sendTrack.callback) {
        sendTrack.callback(null, replyEvent)
      }
      delete this._sendEventTracker[event.id]
    } else {
      debug('recv Reply Message Timeouted!!', replyEvent)
      // update by huang @04-23-2018
      // 问题：设备没有向服务发消息，却收到了回复，导致ws不断重连和断开
      // 决策：改为进程退出
      // this._ws.close(4000, `Reply Event Timeout: ${replyEvent.name}`)
      // process.exit(1)
    }
  }
  _send (name, data, callback) {
    if (this._ws) {
      this._sendTrackEventId += 1
      const event = {
        id: this._sendTrackEventId,
        event: {
          name,
          data
        }
      }
      debug('-------SEND-------:2222', event)
      this._ws.send(JSON.stringify(event))
      this._sendEventTracker[event.id] = {
        event,
        callback,
        at: _.now()
      }
    } else if (callback) {
      callback(new Error(`Not Connect to server on send :${name}`))
    }
  }
}

export default new WsClient()
