const expressSession = require('express-session')
const MongoStrore = require('connect-mongo')(expressSession)
const debug = require('debug')('js:session')
const whiteList = require('./whiteList')
const jwtToken = require('../util')

const app = global.project.app
const mongoStoreOption = {
  url: 'mongodb://localhost:27017/session'
}
const sessionOptions = {
  secret: 'mrhuang2365',
  saveUninitialized: true,
  store: new MongoStrore(mongoStoreOption),
  resave: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}

// 创建会话
const session = expressSession(sessionOptions)
session.sessionOptions = sessionOptions

app.use(session)
app.use('/', async (req, res, next) => {
  // 放行白名单
  if (whiteList.indexOf(req.url) >= 0) {
    next()
    return
  } 
  // 验证token 和session
  const token =  req.headers['x-token'];
  try {
    await jwtToken.checkToken(token);
  } catch (error) {
    res.status(401).json({errMessage: 'Token已过期，请重新登录', errCode: 1})
    return
  }
  if (req.session.userinfo && req.session.userinfo.name) {
    req.session._garbage = Date()
    next()
  } else {
    res.status(401).json({errMessage: '会话已过期，请重新登录', errCode: 1})
  }
})
