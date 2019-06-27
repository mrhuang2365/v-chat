const debug = require('debug')('js:initIndex');

global.project.db.collection('user').createIndexes(
  [ 
    { key:{name:1}, unique: true }
  ]
)