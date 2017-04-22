const amqp = require('fluent-amqp')
const host = process.env.RABBITMQ__HOST || 'amqp://localhost'
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'warn'

const logger = amqp(host)
  .exchange('logs', 'fanout', {durable: true})

const pickups = amqp(host)
  .exchange('dispatch', 'x-delayed-message', {durable: true, arguments: {'x-delayed-type': 'direct'}})
  .queue('dispatcher')
  .subscribe({noAck: false})

module.exports = {logger, pickups}
