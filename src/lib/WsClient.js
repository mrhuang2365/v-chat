const debug = require('debug')('wsClient')

const ws = new WebSocket('ws://localhost:3000')
debug('wsClient---------')
ws.onopen = (event) => {
  debug('---onopen', event)
}
ws.onclose = (event) => {
  debug('---onclose', event)
}
ws.onmessage = (event) => {
  debug('---onmessage', event)
  // ws.send('xxxxxxxxxxx')
}
