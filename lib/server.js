const express = require('express')
const socketIo = require('socket.io')
const {Server} = require('http')
const {logger, pickups} = require('./rabbitmq')

const app = express()
const server = Server(app)
const io = socketIo.listen(server)

app.use(express.static('public'))
app.use(express.static('node_modules/moment'))

server.listen(process.env.PORT || 4000)

function logPickup (msg) {
  logger.publish({
    source: 'dispatch',
    timestamp: new Date(),
    level: 'info',
    message: 'pickup',
    data: msg
  })
}

function logError (err) {
  logger.publish({
    source: 'dispatch',
    timestamp: new Date(),
    level: 'error',
    message: err.message,
    error: err
  })
}

function sendPickup (msg) {
  if (Object.keys(io.sockets.connected).length > 0) {
    const pickup = msg.json()
    io.emit('dispatch', msg.json())
    msg.ack()
    logPickup(pickup)
  } else {
    setTimeout(() => sendPickup(msg), 1000)
  }
}

pickups
  .errors(err => logError(err))
  .each(msg => sendPickup(msg))
