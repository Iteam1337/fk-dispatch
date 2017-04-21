const express = require('express')
const socketIo = require('socket.io')
const {Server} = require('http')

const app = express()
const server = Server(app)
const io = socketIo.listen(server)

app.use(express.static('public'))
app.use(express.static('node_modules/moment'))

server.listen(process.env.PORT || 4000)

const amqp = require('fluent-amqp')
const host = process.env.RABITMQ__HOST || 'amqp://localhost'
const ex = 'dispatch'
const exchangeType = 'x-delayed-message'
const q = 'dispatcher'
const durable = true
const arguments = {'x-delayed-type': 'direct'}

process.env.LOG_LEVEL = 'debug'

function sendDispatch (msg) {
  if (Object.keys(io.sockets.connected).length > 0) {
    io.emit('dispatch', msg.json())
  } else {
    setTimeout(() => sendDispatch(msg), 1000)
  }
}

amqp(host)
  .exchange(ex, exchangeType, {durable, arguments})
  .queue(q)
  .subscribe({noAck: false})
  .errors(err => console.error(err))
  .each(msg => {
    console.log(` [x] Received '${JSON.stringify(msg.json(), null, 2)}'`)
    sendDispatch(msg)
    msg.ack()
  })
