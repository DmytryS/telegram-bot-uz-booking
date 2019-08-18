import amqp from 'amqplib'
import EventEmitter from 'events'
import logger from './logger.js'

export class Queue {
  constructor() {
    this._connection = false
    this._channel = false
  }

  get connection() {
    return this._connection
  }

  get channel() {
    return this._channel
  }

  async start() {
    await this._initChannel()
  }

  async stop() {
    await this._closeChannel()
    await this._closeConnection()
  }

  async _getConnection() {
    let conn = this.connection

    while (!conn) {
      logger.info('Trying to connect RabbitMQ')
      try {
        // eslint-disable-next-line
        conn = await amqp.connect(process.env.RABBIT_MQ_URI);
        this.connection = conn
      } catch (_) {
        // eslint-disable-next-line
        await new Promise(resolve =>
          setTimeout(resolve, process.env.RABBIT_RECONNECT_INTERVAL)
        )
      }
      if (conn) {
        logger.info('Connected to RabbitMQ')
        // this.connection.on('close', this._onClose);
        // this.connection.on('error', this._onError);
      }
    }

    return conn
  }

  /**
   * Closes connection
   */
  async _closeConnection() {
    if (!this.connection) {
      return
    }
    await this.connection.close()
  }

  async _initChannel() {
    if (this.channel) {
      return
    }
    const connection = await this._getConnection()
    const channel = await connection.createChannel()
    this._channel = channel
  }

  /**
   * Closes channel
   */
  async _closeChannel() {
    if (!this.channel) {
      return
    }
    await this.channel.close()
  }

  _onClose() {
    logger.info('Connected to RabbitMQ')

    logger.info('Reconnecting')
    return setTimeout(
      this._getConnection,
      process.env.RABBIT_RECONNECT_INTERVAL
    )
  }


  // eslint-disable-next-line
  _onError(err) {
    if (err.message !== 'Connection closing') {
      logger.info('Connection error', err.message)
    }
  }

  async produce(queue, message, durable = false, persistent = false) {
    await this.channel.assertQueue(queue, { durable })
    await this.channel.sendToQueue(queue, Buffer.from(message), {
      persistent,
    })

    // this.logger.info('Message produced: ', queue, message);
  }

  async consume(queue, isNoAck = false, durable = false, prefetch = null) {
    await this.channel.assertQueue(queue, { durable })

    if (prefetch) {
      this.channel.prefetch(prefetch)
    }
    const consumeEmitter = new EventEmitter()
    try {
      this.channel.consume(
        queue,
        message => {
          if (message !== null) {
            consumeEmitter.emit('data', message.content.toString(), () =>
              this.channel.ack(message)
            )
          } else {
            const error = new Error('NullMessageException')
            consumeEmitter.emit('error', error)
          }
        },
        { noAck: isNoAck }
      )
    } catch (error) {
      logger.error(`Consume error occured: ${error}`)
      consumeEmitter.emit('error', error)
    }
    return consumeEmitter
  }

  async publish(exchangeName, exchangeType, message) {
    await this.channel.assertExchange(exchangeName, exchangeType, {
      durable: false,
    })
    await this.channel.publish(exchangeName, '', Buffer.from(message))

  }

  async subscribe(exchangeName, exchangeType) {
    await this.channel.assertExchange(exchangeName, exchangeType, {
      durable: false,
    })
    const queue = await this.channel.assertQueue('', {
      exclusive: true,
    })
    this.channel.bindQueue(queue.queue, exchangeName, '')
    const consumeEmitter = new EventEmitter()

    try {
      this.channel.consume(
        queue.queue,
        message => {
          if (message !== null) {
            consumeEmitter.emit('data', message.content.toString())
          } else {
            const error = new Error('NullMessageException')
            consumeEmitter.emit('error', error)
          }
        },
        { noAck: true }
      )
    } catch (error) {
      logger.error(`Subscribe error occured: ${error}`)
      consumeEmitter.emit('error', error)
    }
    return consumeEmitter
  }
}

export default new Queue()
