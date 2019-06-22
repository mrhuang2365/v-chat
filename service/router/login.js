const express = require('express')
const svgCaptcha = require('svg-captcha')
const debug = require('debug')('js:login')
const router = express.Router()

/**
 * 获取验证码
 */
router.post('/getCapt', (req, res) => {
  const c = svgCaptcha.create({
    size: 6,
    noise: 3
  })
  req.session.code = c.text
  res.status(200).json({body: c.data})
})

/**
 * 登录
 */
router.post('/signIn', (req, res) => {
  res.status(200).json({res: 'ok'})
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
