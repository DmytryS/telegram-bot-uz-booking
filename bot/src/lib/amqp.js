import amqp from 'amqplib'
import crypto from 'crypto'
import EventEmitter from 'events'
import logger from './logger.js'
import { inspect } from 'util'

const RETRIES = 5
const RESPONSE_TIMEOUT = 1000
const {
  AMQP_URI,
  AMQP_RECONNECT_INTERVAL,
} = process.env
const CONNECTIONS = {
  connection: false,
  channel: false,
}
let counter = 0

const createConnection = async infinityRetries => {
  counter++
  logger.info(`[AMQP] Trying to connect ${AMQP_URI}`)

  try {
    CONNECTIONS.connection = await amqp.connect(AMQP_URI)

    logger.info(`[AMQP] Connected ${AMQP_URI}`)
    logger.info('[AMQP] Creating channel')

    // eslint-disable-next-line
    CONNECTIONS.channel = await CONNECTIONS.connection.createChannel()
    CONNECTIONS.connection.on('error', onError)

    // eslint-disable-next-line
    CONNECTIONS.channel.responseEmitter = new EventEmitter()
    CONNECTIONS.channel.responseEmitter.setMaxListeners(0)
    CONNECTIONS.channel.consume(
      'amq.rabbitmq.reply-to',
      msg => {
        CONNECTIONS.channel.responseEmitter.emit(
          msg.properties.correlationId,
          msg,
        )
      },
      { noAck: true },
    )

    clearInterval(this)

    logger.info('[AMQP] Created channel')

    return true
  } catch (err) {
    // eslint-disable-next-line
    CONNECTIONS.channel = false
    // eslint-disable-next-line
    CONNECTIONS.connection = false

    logger.error(`[AMQP] ERROR: ${JSON.stringify(err)}`)

    if (counter >= RETRIES && !infinityRetries) {
      clearInterval(this)
      throw new Error(`[AMQP] Failed to connect to ${AMQP_URI}`)
    }
  }
}

const formatOutputData = (data) => {
  if (typeof data === 'object' && data !== null) {
    return Buffer.from(JSON.stringify(data))
  }

  return Buffer.from(data)
}

const onError = (err) => {
  if (err.message !== 'Connection closing') {
    logger.info(`[AMQP] ERROR: ${err.message}`)
  }
}

const connect = (infinityRetries) => new Promise((resolve, reject) => {
  createConnection(false)
    .catch((err) => {
      if (infinityRetries) {
        setInterval(
          createConnection(infinityRetries),
          AMQP_RECONNECT_INTERVAL,
        )
      } else {
        reject(err.message)
      }
    })
    .then(() => {
      resolve()
    })
})

export const listen = async (queue, callback, prefetchNumber) => {
  if (!CONNECTIONS.connection) {
    await connect(true)
  }
  const { channel } = CONNECTIONS

  await channel.assertQueue(
    queue,
    {
      durable: false,
    },
  )

  if (prefetchNumber) {
    logger.info(`[AMQP] Setting prefetch number to "${prefetchNumber}"`)
    channel.prefetch(1)
  }

  logger.info(`[AMQP] Listening ${queue} queue`)

  channel.consume(queue, async (message) => {
    let ouputMessage = {}

    try {
      message.content = JSON.parse(message.content.toString('utf8'))

      logger.info(`Received message from queue ${queue}`, message.content)

      ouputMessage = await callback(message.content)
    } catch (err) {
      logger.error(`[AMQP] Listener ERROR: ${inspect(err, { output: true, depth: 4 })}`)

      ouputMessage.error = {
        message: err.message,
        stack: err.stack,
      }
    }

    const { correlationId, replyTo } = message.properties
    if (correlationId && replyTo) {
      await channel.assertQueue(replyTo, { durable: false })
      await channel.sendToQueue(
        replyTo,
        formatOutputData(ouputMessage),
        {
          correlationId,
        },
      )
    }

    await channel.ack(message)
  })
}

// eslint-disable-next-line
export const publish = async (queue, message) => {
  if (!CONNECTIONS.connection) {
    await connect()
  }
  const { channel } = CONNECTIONS

  logger.info(`[AMQP] Publishing data to ${queue}`, message)

  // await CONNECTIONS.channel.assertExchange(queue, 'fanout')
  // return CONNECTIONS.channel.publish(
  //   queue,
  //   '',
  //   formatOutputData(message),
  // )

  if (!channel) {
    throw new Error('Failed to send message')
  }

  await channel.assertQueue(queue, { durable: false })
  return channel.sendToQueue(
    queue,
    formatOutputData(message),
  )
}

// eslint-disable-next-line
export const request = async (queue, message) => {
  if (!CONNECTIONS.connection) {
    await connect()
  }
  const { channel } = CONNECTIONS

  logger.info(`[AMQP] Requesting data from ${queue}`)

  await channel.assertQueue(
    queue,
    {
      durable: false,
    },
  )

  return new Promise((resolve, reject) => {
    const correlationId = crypto.randomBytes(7).toString('hex')
    let timeout
    channel.responseEmitter.once(
      correlationId,
      (response) => {
        clearTimeout(timeout)
        channel.responseEmitter.removeAllListeners(correlationId)
        resolve(JSON.parse(response.content.toString('utf8')))
      },
    )

    CONNECTIONS.channel.sendToQueue(
      queue,
      formatOutputData(message),
      {
        correlationId,
        replyTo: 'amq.rabbitmq.reply-to',
      },
    )

    timeout = setTimeout(
      () => {
        logger.error('[AMQP] RPC timeout')
        channel.responseEmitter.removeAllListeners(correlationId)
        reject(new Error('timeout'))
      },
      RESPONSE_TIMEOUT,
    )
  })
}

export const close = async () => {
  if (CONNECTIONS.channel) {
    await CONNECTIONS.channel.close()
  }

  if (CONNECTIONS.connection) {
    await CONNECTIONS.connection.close()
  }

  // eslint-disable-next-line
  CONNECTIONS.channel = false
  // eslint-disable-next-line
  CONNECTIONS.connection = false

  logger.info(`[AMQP] Disconnected from ${AMQP_URI}`)
}
