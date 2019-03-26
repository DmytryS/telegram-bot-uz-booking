import amqp from "amqplib";
import _ from "lodash";
import logger from "./logger";
import EventEmitter from "events";

export class Queue {
  constructor() {
    this.logger = logger.getLogger("QUEUE");
    this.connection = false;

    this.connect();
  }

  async connect() {
    let conn = this.connection;
    while (!conn) {
      try {
        conn = await amqp.connect(process.env.RABBIT_MQ_URI);
        this.connection = conn;
      } catch (_) {
        await new Promise(resolve =>
          setTimeout(resolve, process.env.RABBIT_RECONNECT_INTERVAL)
        );
      }
    }
    return conn;
  }

  async produce(queue, message, durable = false, persistent = false) {
    const channel = await this.connection.createChannel();

    await channel.assertQueue(queue, { durable });
    await channel.sendToQueue(queue, Buffer.from(message), { persistent });

    amqpLogger.info("Message produced: ", queue, message);
  }

  async consume(queue, isNoAck = false, durable = false, prefetch = null) {
    const channel = await this.connection.createChannel();

    await channel.assertQueue(queue, { durable });

    if (prefetch) {
      channel.prefetch(prefetch);
    }
    const consumeEmitter = new EventEmitter();
    try {
      channel.consume(
        queue,
        message => {
          if (message !== null) {
            consumeEmitter.emit("data", message.content.toString(), () =>
              channel.ack(message)
            );
          } else {
            const error = new Error("NullMessageException");
            consumeEmitter.emit("error", error);
          }
        },
        { noAck: isNoAck }
      );
    } catch (error) {
      consumeEmitter.emit("error", error);
    }
    return consumeEmitter;
  }

  async publish(exchangeName, exchangeType, message) {
    const channel = await this.connection.createChannel();

    await channel.assertExchange(exchangeName, exchangeType, {
      durable: false
    });
    await channel.publish(exchangeName, "", Buffer.from(message));

    amqpLogger.info("Message published: ", exchangeName, message);
  }

  async subscribe(exchangeName, exchangeType) {
    const channel = await this.connection.createChannel();

    await channel.assertExchange(exchangeName, exchangeType, {
      durable: false
    });
    const queue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(queue.queue, exchangeName, "");
    const consumeEmitter = new EventEmitter();

    try {
      channel.consume(
        queue.queue,
        message => {
          if (message !== null) {
            consumeEmitter.emit("data", message.content.toString());
          } else {
            const error = new Error("NullMessageException");
            consumeEmitter.emit("error", error);
          }
        },
        { noAck: true }
      );
    } catch (error) {
      consumeEmitter.emit("error", error);
    }
    return consumeEmitter;
  }
}

export default new Queue();
