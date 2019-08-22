import amqp from 'amqplib'
import logger from './logger.js'

const RETRIES = 5
let counter = 0

const CONNECTIONS = {
  connection: false,
  channel: false
}

const onError = (err) => {
  if (err.message !== 'Connection closing') {
    logger.info(`[AMQP] ERROR: ${err.message}`)
  }
}

const connect = (infinityRetries) => new Promise((resolve, reject) => {
  setInterval(
    async function () {
      counter++
      logger.info(`[AMQP] Trying to connect ${process.env.RABBIT_MQ_URI}`)

      try {
        CONNECTIONS.connection = await amqp.connect(process.env.RABBIT_MQ_URI)

        logger.info(`[AMQP] connected ${process.env.RABBIT_MQ_URI}`)
        logger.info('[AMQP] creating channel')

        // eslint-disable-next-line
        CONNECTIONS.channel = await CONNECTIONS.connection.createChannel()
        CONNECTIONS.connection.on('error', onError)
        clearInterval(this)

        logger.info('[AMQP] created channel')

        resolve()
      } catch (err) {
        // eslint-disable-next-line
        CONNECTIONS.channel = false
        // eslint-disable-next-line
        CONNECTIONS.connection = false

        logger.error(`[AMQP] ERROR: ${JSON.stringify(err)}`)

        if (counter >= RETRIES && !infinityRetries) {
          clearInterval(this)
          reject(`[AMQP] Failed to connect to ${process.env.RABBIT_MQ_URI}`)
        }
      }
    },
    process.env.RABBIT_RECONNECT_INTERVAL
  )
})

export const listen = async (queue, callback) => {
  if (!CONNECTIONS.connection) {
    await connect(true)
  }

  await CONNECTIONS.channel.assertQueue(
    queue,
    {
      durable: false
    }
  )

  CONNECTIONS.channel.consume(queue, async (message) => {
    let ouputMessage = {}

    try {
      ouputMessage = await callback(message.content.toString())
    } catch (err) {
      logger.error(`[AMQP] Listener ERROR: ${JSON.stringify(err)}`)

      ouputMessage.error = err
    }
  })
}

// eslint-disable-next-line
export const publish = async (queue, message) => {
  if (!CONNECTIONS.connection) {
    await connect()
  }

  logger.info(`[AMQP] Publishing data to ${queue}`)

  await CONNECTIONS.channel.assertQueue(queue, {
    durable: false
  })

  await CONNECTIONS.channel.sendToQueue(queue, Buffer.from(message))
}

// eslint-disable-next-line
export const request = async (queue, message) => {
  if (!CONNECTIONS.connection) {
    await connect()
  }

  logger.info(`[AMQP] Requesting data from ${queue}`)
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

  logger.info(`[AMQP] Disconnected from ${process.env.RABBIT_MQ_URI}`)
}
