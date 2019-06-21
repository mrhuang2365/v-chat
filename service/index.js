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

debug('Process argv:', process.argv)
// websocket服务
require('./ws/wsServer')
// session服务
require('./session')
// require('./session').sessionInit(app)

server.listen(Port, () => {
  debug('Listening on Port:', Port)
})

app.post('/api/test', (req, res) => {
  debug('Req Body:', req.body)
  res.status(200).json({data: 'ok'})
})
app.get('/api/test1', (req, res) => {
  debug('Req Test:', req.query)
  res.sendfile(path.resolve(__dirname, '../static/logo.png'))
})

require('./mongo')
