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

// websocket服务
require('./WsServer')
// session服务
require('./session').sessionInit(app)

server.listen(Port, () => {
  debug('Listening on Port:', Port)
})

app.post('/api', (req, res) => {
  debug('Req Body:', req.body)
  res.status(200).json({data: 'ok'})
})