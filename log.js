const amqp = require('fluent-amqp')
const moment = require('moment')

const host = process.env.RABBITMQ__HOST || 'amqp://localhost'
const ex = 'logs'
const exchangeType = 'fanout'
const durable = true

const [,,source, level, message] = process.argv

process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'debug'

const event = {
  source: source || 'schedule',
  timestamp: moment().toDate(),
  level: level || 'info',
  message: message || 'Wohoo!'
}
if (event.level === 'error') {
  event.error = new Error(event.message)
}

amqp(host)
  .exchange(ex, exchangeType, {durable})
  .publish(event)
  .then(() => console.log(` [x] Sent '${JSON.stringify(message, null, 2)}'`) || 0)
  .catch(err => console.error(err) || 1)
  .then(status => setTimeout(() => { process.exit(status)}, 1000))
