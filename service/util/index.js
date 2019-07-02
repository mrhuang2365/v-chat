const jwt = require('jsonwebtoken')
const tokenPrivateKey = 'vchat_'

function makeToken(){
  return jwt.sign({ foo: 'bar' }, tokenPrivateKey)
}

function checkToken(token){
  return new Promise((res, rej) => {
    jwt.verify(token, tokenPrivateKey, function(err, decoded) {
      if (err) {
        rej(err);
      } else {
        res();
      }
    })
  })
}

module.exports = {
  makeToken,
  checkToken,
}