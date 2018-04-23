const WebSocket = require('ws')
const debug = require('debug')('js:WsServer')
const _ = require('lodash')
// const url = require('url')

class Ws {
  constructor () {
    this.wsConnections = {}
    this._genId = 0
    this.ws = null
    // createWs
    this.createWs()

    setInterval(() => {
      this.heartBeat()
    }, 5000)
  }
  // 创建ws
  createWs () {
    this.ws = new WebSocket.Server({server: global.project.server})
    this.ws.on('connection', (conn, req) => {
      debug('-----x:', req.headers.origin)
      conn.on('message', (event) => {
        debug('On Message:', event)
      })
      // 处理连接事件-Close
      conn.on('close', (code, reason) => {
        conn.wsStatusSet('closeAt', new Date())
        conn.wsStatusSet('status', 'closed')
        conn.wsStatusSet('code', code)
        conn.wsStatusSet('reason', reason)
        conn.wsStatusSave()
        debug('=====WEBSOCKET close', conn.remoteAddress, code, reason)
        // 注销连接
        delete this.wsConnections[conn.id]
      })
      this.addWsConnection(conn, req)
    })
  }
  // 添加ws队列
  addWsConnection (conn, req) {
    conn.id = this.getGenId()
    conn.req = req
    conn.remoteAddress = req.headers.origin
    conn.status = {
      connId: conn.id,
      createdAt: new Date(),
      from: conn.remoteAddress,
      status: 'connected'
    }
    // 更新连接状态
    this._addWsStatusFunctions(conn)
    conn.wsStatusSet(conn.status)
    // 添加到连接跟踪表
    this.wsConnections[conn.id] = conn
  }
  _addWsStatusFunctions (conn) {
    conn._wsStatusUpdateValues = {}

    /**
     * 设置连接状态到数据库，参数可选为(key,value) 或者一个对象
     * @param {String | Object} 参数，对象或字符串
     */
    conn.wsStatusSet = (keyOrObject, value) => {
      if (!conn._wsStatusUpdateValues.$set) {
        conn._wsStatusUpdateValues.$set = {}
      }
      if (_.isString(keyOrObject)) {
        conn._wsStatusUpdateValues.$set[keyOrObject] = value
      } else if (_.isPlainObject(keyOrObject)) {
        _.assign(conn._wsStatusUpdateValues.$set, keyOrObject)
      }
    }
    conn.wsStatusInc = (key, value) => {
      if (!conn._wsStatusUpdateValues.$inc) {
        conn._wsStatusUpdateValues.$inc = {}
      }
      conn._wsStatusUpdateValues.$inc[key] = value
    }
    conn.wsStatusSave = () => {
      if (!_.isEmpty(conn._wsStatusUpdateValues)) { }
      conn._wsStatusUpdateValues = {}
    }
  }
  // 更新genId
  getGenId () {
    this._genId += 1
    return this._genId
  }
  // 删除连接
  closeConnection (connId, code, reason) {
    const _conn = this.wsConnections[connId]
    if (_conn) {
      debug('======closeConnection')
      _conn.close(code, reason)
      return true
    }
    return false
  }
  heartBeat () {
    this.broadcast('heartbeat', {name: 'jshuang'}, (err, event) => {
      if (err) {
        this.closeConnection(event.connId, '1001', `HeartBeat Error:${err.message}`)
      }
    })
  }
  send (connId, name, data, callback) {
    const conn = this.wsConnections[connId]
    const event = {
      name,
      data
    }
    try {
      conn.send(JSON.stringify(event))
    } catch (e) {
      debug('conn not open!', connId)
      callback('Connect already closed!', { connId })
    }
  }
  broadcast (name, data, callback) {
    debug('wsConnections Length:', _.size(this.wsConnections))
    _.forEach(this.wsConnections, (conn) => {
      this.send(conn.id, name, data, callback)
    })
  }
}
module.exports = new Ws()
