const redis = require('redis')
const RedisNotifier = require('redis-notifier')

const config = {
  host: process.env.REDIS__HOST || 'localhost',
  port: process.env.REDIS__PORT || 6379
}
const client = redis.createClient(config)
client.select(0)
 
const notifier = new RedisNotifier(redis, {
  redis: config,
  expired: true,
  evicted: false,
  logLevel: 'INFO' //Defaults To INFO 
})

function handleExpired (key) {
  console.log(`${key} expired`)
  client.get(key, (err, val) => {
    if (err) {
      console.error(err)
    } else {
      console.log(`last chance to see ${val}`)
    }
  })
}
 
//Listen for event emission 
notifier.on('message', (pattern, channelPattern, emittedKey) => {
  const channel = notifier.parseMessageChannel(channelPattern)
  switch(channel.key) {
    case 'expired':
      handleExpired(emittedKey)
      break
    default:
      console.log("Unrecognized Channel Type:" + channel.type)
  }
})
notifier.on('error', (...args) => console.error(...args))

function setKey () {
  const key = Math.round(Math.random() * 10000).toString(16)
  client.SETEX([key, 2, 'value'], (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log(`stored ${key}`)
    }
  })
}

client.on('ready', () => {
  console.log('start expiring keys!')
  setInterval(() => setKey(), 3000)
})
