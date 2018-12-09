/* eslint-disable no-underscore-dangle,no-param-reassign,class-methods-use-this,
prefer-promise-reject-errors,standard/no-callback-literal */
const WebSocket = require('ws')
const debug = require('debug')('js:wsServer')
const _ = require('lodash')
const EE = require('eventemitter3')

const PROTOCOL = 'ws.event'
const SEND_EVENT_TIMEOUT = 10000
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

class WsServer {
  constructor () {
    this._connections = {} // 所有连接注册列表，格式: {connId:connObject}
    this._ws = null
    this._connId = 0
    // createWs
    this._createWs()

    // 接收事件监听器，使用on注册
    this._eventListener = new EE()
    // 发送事件跟踪器，检测超时,格式: {eventId: EventObject}
    this._sendTrackEventId = 0
    this._sendEventTracker = {}
    setInterval(() => {
      this._doCheckSendTimeout()
    }, 2000)
    // 心跳计数器，发送心跳
    this._heartbeatId = 0
    setInterval(() => {
      this._doHeartbeat()
    }, 5000)
  }
  /* *********************  公有函数  ********************************** */
  on (name, callback) {
    this._eventListener.on(name, callback)
  }
  // 通知ws消息
  wsSendOneSync (mac, msgName, msgData) {
    const _conn = _.find(this._connections, o => o.mac === mac)
    return new Promise((resolve, reject) => {
      if (_conn) {
        try {
          this._send(_conn.id, msgName, msgData, (err, event) => {
            if (err) {
              reject({
                message: err
              })
            } else {
              resolve({
                name: event.name,
                data: event.data
              })
            }
          })
        } catch (e) {
          reject({
            message: `网络异常${e.message}`,
          })
        }
      } else {
        reject({
          message: '设备不在线',
        })
      }
    })
  }
  // 通知ws消息
  wsSend (macArr, msgName, msgData) {
    _.map(macArr, (mac) => {
      const _conn = _.find(this._connections, o => o.mac === mac)
      if (_conn) {
        try {
          this._send(_conn.id, msgName, msgData, ( /* err, event */ ) => {
            debug('===============sendg mac:', mac)
          })
        } catch (e) {

        }
      }
    })
  }
  // 通知ws消息
  wsSendAll (msgName, msgData) {
    console.log('wsArticle通知' + msgName)
    console.log(this._connections)
    _.map(this._connections, (_conn) => {
      try {
        this._send(_conn.id, msgName, msgData, ( /* err, event */ ) => {
          debug('发送通知成功')
        })
      } catch (e) {
        debug('发送通知错误', e)
      }
    })
  }
  /* *********************  私有函数  ********************************** */
  // 创建ws
  _createWs () {
    this.ws = new WebSocket.Server({
      server: global.project.server
    })
    this.ws.on('connection', (conn, req) => {
      // 检查协议
      if (conn.protocol !== PROTOCOL) {
        debug('Invalid PROTOCOL:', conn.protocol)
        conn.close(1002, 'Invalid Protocol')
        return
      }
      // 成功创建请求，添加连接对象到服务中
      this._addWsConnection(conn, req)
      // 处理连接事件-Error
      conn.on('error', (err) => {
        // 关闭日志
        debug('WEBSOCKET error', conn.remoteAddress, err)
      })
      // 处理连接事件-Close
      conn.on('close', (code, reason) => {
        debug('=====WEBSOCKET close', conn.remoteAddress, code, reason)
        // 注销连接
        delete this._connections[conn.id]
      })
      conn.on('message', (data) => {
        // 根据注册的监听消息，响应事件，事件为标准JSON格式，并为标准应答模式
        // debug('WEBSOCKET message', conn.id, conn.remoteAddress, data)
        let json = {}
        try {
          json = JSON.parse(data)
        } catch (e) {
          conn.close(4000, 'INVALID Message Format')
          return
        }
        // 接收到对方发送消息
        if (_.isPlainObject(json.event) && _.isString(json.event.name)) {
          const event = new WsEvent(conn, json)
          this._onRecvedEvent(event)
        } else if (_.isPlainObject(json.reply)) {
          this._onRecvedReply(json, conn)
        } else {
          debug('Websocket Invalid Message Type:', json)
          conn.close(4000, 'INVALID Message Type')
        }
      })
    })
  }
  // 添加ws队列
  _addWsConnection (conn, req) {
    conn.id = this._getConnId()
    conn.req = req
    conn.remoteAddress = req.headers.origin
    conn.status = {
      connId: conn.id,
      createdAt: new Date(),
      from: conn.remoteAddress,
      status: 'connected'
    }
    // 添加到连接跟踪表
    this._connections[conn.id] = conn
  }
  // 更新connId
  _getConnId () {
    this._connId += 1
    return this._connId
  }
  _getConnection (connId) {
    return this._connections[connId]
  }
  _doCheckSendTimeout () {
    const now = _.now()
    _.forEach(this._sendEventTracker, (v, k) => {
      if ((now - v.at) > SEND_EVENT_TIMEOUT) {
        debug('Websocket Wait Reply Event TIME OUT:', k, v.event.event.name)
        delete this._sendEventTracker[k]
        // 直接关闭连接
        this._closeConnection(v.connId, 4000, `wait reply Timeout: ${v.event.event.name}`)
        v.callback('Event Timeout', {
          connId: v.connId
        })
      }
    })
  }
  // 转发ws通知
  _onRecvedEvent (event) {
    if (event.name === 'wsOpen') {
      debug('================', event.conn.id, event.data)
      // 查找已有的连接，close
      // const _oldConn = _.find(this._connections, o => o.mac === event.data.mac)
      // if (_oldConn) _oldConn.close(4000, `del old mac: ${event.data.mac} ${event.name}`)
      // 新的连接中记录mac
      event.conn.mac = event.data.mac
      // reply
      event.replyEvent({
        mac: event.data.mac
      })
    } else if (!this._eventListener.emit(event.name, event)) {
      // 未注册监听
      event.conn.close(4000, `unregistered Event: ${event.name}`)
    } else {
      event.connId = event.conn.id
      // this._updateEventRecvStatus(event)
    }
  }
  // 收到reply
  _onRecvedReply (event, conn) {
    // 查找已经注册的发送消息，执行发送回调消息
    const sendTrack = this._sendEventTracker[event.id]
    if (sendTrack) {
      const replyEvent = {
        id: event.id,
        name: event.reply.name,
        data: event.reply.data,
        connId: sendTrack.connId,
        duration: _.now() - sendTrack.at
      }
      if (sendTrack.callback) {
        sendTrack.callback(null, replyEvent)
      }
      delete this._sendEventTracker[event.id]
    } else {
      debug('recv Reply Message Timeouted!!', event.id)
      conn.close(4000, `Reply Event Timeout: ${event.reply.name}`)
    }
  }
  // 删除连接
  _closeConnection (connId, code, reason) {
    const _conn = this._connections[connId]
    if (_conn) {
      debug('======closeConnection')
      _conn.close(code, reason)
      return true
    }
    return false
  }
  // 发送心跳
  _doHeartbeat () {
    this._heartbeatId += 1
    const hbid = this._heartbeatId
    this._broadcast('heartbeat', {
      beat: hbid
    }, (err, event) => {
      if (err) {
        // 心跳错误，挂断连接
        this._closeConnection(event.connId, 4000, `Heartbeat Error:${err.message}`)
      } else if (_.toNumber(event.data.beat) === hbid) {
        // 保存心跳应答信息到日志
        event.at = new Date()
        debug(`Heartbeat OK: cid=${event.connId}, eid=${event.id}, ms=${event.duration}`)
      } else {
        debug('Heartbeat Err', event.data.beat, hbid)
        this._closeConnection(event.connId, 4000, 'Heartbeat Reply Format Error')
      }
    })
  }
  // 发送信息
  _send (connId, name, data, callback) {
    const conn = this._connections[connId]
    if (conn) {
      this._sendTrackEventId += 1
      const event = {
        id: this._sendTrackEventId,
        event: {
          name,
          data
        },
      }
      try {
        conn.send(JSON.stringify(event))
        this._sendEventTracker[event.id] = {
          event,
          callback,
          at: _.now(),
          connId
        }
      } catch (e) {
        debug('conn not open!', connId)
        if (_.isFunction(callback)) {
          callback('Connect already closed!', {
            connId
          })
        }
      }
    } else {
      debug('request send connect not existed!', connId)
      if (_.isFunction(callback)) {
        callback('Connect already closed!', {
          connId
        })
      }
    }
  }
  // ws广播
  _broadcast (name, data, callback) {
    debug('_connections Length:', _.size(this._connections))
    _.forEach(this._connections, (conn) => {
      this._send(conn.id, name, data, callback)
    })
  }
}

module.exports = new WsServer()
