const expressSession = require('express-session')
const MongoStrore = require('connect-mongo')(expressSession)
const debug = require('debug')('js:session')
const whiteList = require('./whiteList')

const app = global.project.app
const mongoStoreOption = {
  url: 'mongodb://localhost:27017/session'
}
const sessionOptions = {
  secret: 'mrhuang2365',
  saveUninitialized: true,
  store: new MongoStrore(mongoStoreOption),
  resave: false,
  cookie: { maxAge: 5 * 60 * 1000 }
}

// 创建会话
const session = expressSession(sessionOptions)
session.sessionOptions = sessionOptions

app.use(session)
app.use('/', (req, res, next) => {
  debug('----session', req.url, req.session)
  if (whiteList.indexOf(req.url) >= 0) {
    next()
    return
  }
  if (req.session.username) {
    req.session._garbage = Date()
    next()
  } else {
    res.status(401).json({body: '认证已过期，请重新登录'})
  }
})
