/* eslint-disable */
const crypto  = require('crypto');

const MongoClient = require('mongodb').MongoClient
const debug = require('debug')('js:mongo')
// Connection url
const url = 'mongodb://localhost:27017';
const dbName = 'project1'
/**
 * 初始化admin账号
 */
function initAdminUser() {
  const name = 'admin';
  const pwd = 'huang123';
  var md5 = crypto.createHash('md5');
  var result = md5.update(pwd).digest('hex');
  debug('initAdminUser, result', result);
  const col = global.project.db.collection('user')
  col.find({name: name}).toArray((err, item) => {
    if (item.length === 0) {
      col.insert({name, pwd: result, admin: true });
    }
  })
}

module.exports = function(){
  return new Promise((res, rej) => {
    // Connect using MongoClient
    MongoClient.connect(url, function(err, client) {
      if(err) {
        debug('MongoClient Connect Err:', err)
        rej();
        return 
      }
      global.project.db = client.db(dbName);
      // 初始化索引
      require('./dbIndex')
      // 初始化数据库
      initAdminUser();
      res();
    });
  })
}