const process = require('process')
const path = require('path')
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const debug = require('debug')('js:app')
// app.use(bodyParser.json(), {limit: '10mb'})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const Port = 3000
const server = http.createServer(app)
global.project = {}
global.project.server = server
global.project.app = app

const initMongo = require('./mongo');
// 等mongodb数据库连接完成
initMongo().then(() => {
  app.use('/api', require('./router'))
})

debug('Process argv:', process.argv)
// websocket服务
require('./ws/wsServer')
// session服务
require('./session')

server.listen(Port, () => {
  debug('Listening on Port:', Port)
})


