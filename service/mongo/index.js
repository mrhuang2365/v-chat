/* eslint-disable */
const MongoClient = require('mongodb').MongoClient
const debug = require('debug')('js:mongo')
// Connection url
const url = 'mongodb://localhost:27017';
const dbName = 'user'
// Connect using MongoClient
MongoClient.connect(url, async function(err, client) {
  if(err) {
    debug('MongoClient Connect Err:', err)
    return 
  }
  const col = client.db(dbName).collection('userIndex')
  try {
    const res = await col.find({}).toArray();
    debug('Find Res:', res)
  } catch (error) {
    debug('MongoClient Find Error:', error)
  }
});