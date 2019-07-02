const express = require('express')
const svgCaptcha = require('svg-captcha')
const debug = require('debug')('js:login')
const router = express.Router()
const useCol = global.project.db.collection('user')
const jwtToken = require('../util');

/**
 * 获取验证码
 */
router.post('/getCapt', (req, res) => {
  const c = svgCaptcha.create({
    size: 4,
    noise: 2
  })
  req.session.code = c.text
  res.status(200).json({body: c.data, errCode: 0})
})

/**
 * 登录
 */
router.post('/signIn', async (req, res) => {
  debug('req:', req.body);
  if (!req.body || !req.body.name || !req.body.password || !req.body.code) {
    res.status(400).json({errMessage: 'param is invalid', errCode: 1});
    return
  }
  const name = req.body.name;
  const pwd = req.body.password;
  const code = req.body.code;

  // 验证验证码
  if (!req.session.code) {
    res.status(200).json({errMessage: '请重新获取验证码', errCode: 1});
    return
  }
  if (code.toLocaleLowerCase() !== req.session.code.toLocaleLowerCase()){
    res.status(200).json({errMessage: '验证码不正确', errCode: 1});
    return
  }
  // 查找数据库
  const userInfo = await useCol.findOne({name});
  if (!userInfo) {
    res.status(200).json({errMessage: '账号不存在', errCode: 1});
    return
  }
  // 验证密码
  if (pwd === userInfo.pwd) {
    // 生成toekn
    const token = jwtToken.makeToken();
    // 更新session
    req.session.userinfo = {
      name,
      token
    }
    debug('token:', token);
    res.status(200).json({body: {
      token,
      userInfo: {
        name: userInfo.name,
        id: userInfo._id,
        admin: userInfo.admin
      }
    }, errCode: 0})
  } else {
    res.status(200).json({errMessage: '密码不正确', errCode: 1})
  }
})

/**
 * 注册
 */
router.post('/signUp', async (req, res) => {
  if (!req.body || !req.body.name || !req.body.password || !req.body.code) {
    res.status(400).json({errMessage: 'param is invalid', errCode: 1});
    return
  }
  const name = req.body.name;
  const pwd = req.body.password;
  const code = req.body.code;

  // 验证验证码
  if (!req.session.code) {
    res.status(400).json({errMessage: '请重新获取验证码', errCode: 1});
    return
  }
  if (code.toLocaleLowerCase() !== req.session.code.toLocaleLowerCase()){
    res.status(200).json({errMessage: '验证码不正确', errCode: 1});
    return
  }
  // 查找数据库
  try {
    const userInfo = await useCol.findOne({name});
    if (userInfo) {
      res.status(200).json({errMessage: '账号已存在', errCode: 1});
      return
    }
    // 入库
    await useCol.insertOne({
      name,
      pwd,
      admin: false
    })
    res.status(200).json({body:'ok', errCode: 0});
  } catch (error) {
    res.status(200).json({body:error, errMessage: error.message || error, errCode: 1});
  }
})

/**
 * 退出登录
 */
router.post('/signOut', (req, res) => {
  res.status(200).json({res: 'ok'})
})

router.post('/test', (req, res) => {
  res.status(200).json({res: 'ok'})
})

module.exports = router
