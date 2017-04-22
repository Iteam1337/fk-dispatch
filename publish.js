const amqp = require('fluent-amqp')
const moment = require('moment')

const host = process.env.RABBITMQ__HOST || 'amqp://localhost'
const ex = 'dispatch'
const exchangeType = 'x-delayed-message'
const q = 'dispatcher'
const durable = true
const arguments = {'x-delayed-type': 'direct'}

process.env.LOG_LEVEL = 'debug'
const [,,destination, ...names] = process.argv

const time = moment().add(1, 'hour')
const delay = time.clone()
  .subtract(59, 'minutes')
  .subtract(55, 'seconds')
  .diff(moment(), 'milliseconds')

const message = {
  source: 'schedule',
  time: time.toDate(),
  action: 'pickup',
  data: {
    name: names.join(' ') || 'Joe Schmoe',
    location: destination || 'Flygplatsen'
  }
}
amqp(host)
  .exchange(ex, exchangeType, {durable, arguments})
  .publish(message, {headers: {'x-delay': delay}})
  .then(() => console.log(` [x] Sent '${JSON.stringify(message, null, 2)}'`) || 0)
  .catch(err => console.error(err) || 1)
  .then(status => setTimeout(() => { process.exit(status)}, 1000))
