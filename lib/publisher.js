const amqp = require('fluent-amqp')
const moment = require('moment')

const host = process.env.RABITMQ__HOST || 'amqp://localhost'
const ex = 'dispatch'
const exchangeType = 'x-delayed-message'
const q = 'dispatcher'
const durable = true
const arguments = {'x-delayed-type': 'direct'}

process.env.LOG_LEVEL = 'debug'

const time = moment().add(1, 'hour')
const delay = time.clone()
  .subtract(59, 'minutes')
  .subtract(55, 'seconds')
  .diff(moment(), 'milliseconds')

console.log(time)
console.log(delay)

const message = {
  source: 'schedule',
  time: time.toDate(),
  action: 'pickup',
  data: {
    name: 'Johan Öbrink',
    location: 'Flygplatsen'
  }
}
amqp(host)
  .exchange(ex, exchangeType, {durable, arguments})
  .publish(message, {headers: {'x-delay': delay}})
  .then(() => console.log(` [x] Sent '${JSON.stringify(message, null, 2)}'`) || 0)
  .catch(err => console.error(err) || 1)
  .then(status => setTimeout(() => { process.exit(status)}, 1000))
