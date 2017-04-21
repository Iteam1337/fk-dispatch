const amqp = require('fluent-amqp')
const host = process.env.RABITMQ__HOST || 'amqp://localhost'
const ex = 'dispatch'
const exchangeType = 'x-delayed-message'
const q = 'dispatcher'
const durable = true
const arguments = {'x-delayed-type': 'direct'}

process.env.LOG_LEVEL = 'debug'

amqp(host)
  .exchange(ex, exchangeType, {durable, arguments})
  .queue(q)
  .subscribe({noAck: false})
  .errors(err => console.error(err))
  .each(msg => {
    console.log(` [x] Received '${JSON.stringify(msg.json(), null, 2)}'`)
    msg.ack()
  })