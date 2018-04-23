const expressSession = require('express-session')

const sessionOptions = {
  secret: 'mrhuang2365',
  saveUninitialized: true,
  resave: true,
  cookie: { maxAge: 10 * 1000 }
}

// 创建会话
const session = expressSession(sessionOptions)
session.sessionOptions = sessionOptions

module.exports = session
