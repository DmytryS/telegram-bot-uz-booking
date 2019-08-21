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

const connect = () => new Promise((req, res) => {
  setInterval(
    async function () {
      counter++
      logger.info(`[AMQP] Trying to connect ${process.env.RABBIT_MQ_URI}`)
      try {
        CONNECTIONS.connection = await amqp.connect(process.env.RABBIT_MQ_URI)

        logger.info('[AMQP] creating channel')

        CONNECTIONS.channel = await CONNECTIONS.connection.createChannel()
        CONNECTIONS.connection.on('error', onError)
        clearInterval(this)

        logger.info(`[AMQP] connected ${process.env.RABBIT_MQ_URI}`)

        res()
      } catch (err) {
        logger.error(`[AMQP] ERROR: ${JSON.stringify(err)}`)

        if (counter >= RETRIES) {
          clearInterval(this)
        }
      }
    },
    process.env.RABBIT_RECONNECT_INTERVAL
  )
})

export const listen = async (queue, callback) => {
  if (!CONNECTIONS.connection) {
    await connect()
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
      ouputMessage = await callback(message)
    } catch (err) {
      ouputMessage.error = err
    }
  })
}

// eslint-disable-next-line
export const publish = async (queue, message) => {
  if (!CONNECTIONS.connection) {
    await connect()
  }
}

export const send = async (queue, message) => {
  if (!CONNECTIONS.connection) {
    await connect()
  }

  logger.info(`[AMQP] Sending data to ${queue}`)

  await CONNECTIONS.channel.assertQueue(queue, {
    durable: false
  })

  await CONNECTIONS.channel.sendToQueue(queue, Buffer.from(message))
}

export const disconnect = async () => {
  if (CONNECTIONS.channel) {
    await CONNECTIONS.channel.close()
  }

  if (CONNECTIONS.connection) {
    await CONNECTIONS.connection.close()
  }

  CONNECTIONS.channel = false
  CONNECTIONS.connection = false

  logger.info(`[AMQP] Disconnected from ${process.env.RABBIT_MQ_URI}`)
}
