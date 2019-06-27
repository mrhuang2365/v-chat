const express = require('express')
const svgCaptcha = require('svg-captcha')
const debug = require('debug')('js:login')
const router = express.Router()

const useCol = global.project.db.collection('user')
/**
 * 获取验证码
 */
router.post('/getCapt', (req, res) => {
  const c = svgCaptcha.create({
    size: 4,
    noise: 2
  })
  req.session.code = c.text
  res.status(200).json({body: c.data})
})

/**
 * 登录
 */
router.post('/signIn', async (req, res) => {
  debug('req:', req.body);
  if (!req.body || !req.body.name || !req.body.password || !req.body.code) {
    res.status(400).json({err: 'param is invalid'});
    return
  }
  const name = req.body.name;
  const pwd = req.body.password;
  const code = req.body.code;

  // 验证验证码
  if (!req.session.code) {
    res.status(400).json({err: '请重新获取验证码'});
    return
  }
  if (code.toLocaleLowerCase() !== req.session.code.toLocaleLowerCase()){
    res.status(400).json({err: '验证码不正确'});
    return
  }
  // 查找数据库
  const userInfo = await useCol.findOne({name});
  if (!userInfo) {
    res.status(400).json({err: '账号不存在'});
    return
  }
  // 验证密码
  if (pwd === userInfo.pwd) {
    res.status(200).json({res: 'ok'})
  } else {
    res.status(400).json({err: '密码不正确'})
  }
})

/**
 * 注册
 */
router.post('/signUp', (req, res) => {
  res.status(200).json({res: 'ok'})
})

/**
 * 退出登录
 */
router.post('/signOut', (req, res) => {
  res.status(200).json({res: 'ok'})
})

module.exports = router
