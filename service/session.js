const expressSession = require('express-session')
const debug = require('debug')('js:session')

const sessionOptions = {
  secret: 'mrhuang2365',
  saveUninitialized: true,
  resave: false,
  cookie: { maxAge: 10 * 1000 }
}

// 创建会话
const session = expressSession(sessionOptions)
session.sessionOptions = sessionOptions

const sessionInit = (app) => {
  app.use(session)
  app.use('/', (req, res, next) => {
    debug('----session', req.url)
    if (req.session.username) {
      req.session._garbage = Date()
      req.session.touch()
      debug('----session username:', req.session.username, req.session._garbage)
    } else {
      debug('register username')
      req.session.username = 'huang'
    }
    next()
  })
}
module.exports = {
  sessionInit
}
