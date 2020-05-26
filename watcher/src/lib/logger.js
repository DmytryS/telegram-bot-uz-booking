import winston from 'winston'
import hasAnsi from 'has-ansi'
import { inspect } from 'util'
import Transport from 'winston-transport'
import tripleBeam from 'triple-beam'

const DEPTH = 7
const { NODE_ENV } = process.env

const { MESSAGE } = tripleBeam
const inspectOptions = {
  depth: DEPTH,
  colors: true,
  ...NODE_ENV === 'production' || !NODE_ENV ? { compact: true, breakLength: Infinity } : {},
}

const isPrimitive = val => {
  return val === null || (typeof val !== 'object' && typeof val !== 'function')
}

const formatWithInspect = val => {
  const prefix = isPrimitive(val) ? '' : '\n'
  const shouldFormat = typeof val !== 'string' || !hasAnsi(val)
  return  prefix + (shouldFormat ? inspect(val, inspectOptions) : val)
}

class SimpleConsoleTransport extends Transport {
  log(info, callback) {
    setImmediate(() => this.emit('logged', info))
    console.log(info[MESSAGE])
    if (callback) {
      callback()
    }
  }
}

const logger = winston.createLogger({
  level: NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(info => {
      const msg = formatWithInspect(info.message)
      const splatArgs = info[Symbol.for('splat')] || []
      const rest = splatArgs.map(data => formatWithInspect(data)).join(' ')

      return `${info.timestamp} [${info.level}]: ${msg} ${rest}`
    })
  ),
  transports: [
    NODE_ENV === 'development' ? new SimpleConsoleTransport() : new winston.transports.Console()
  ],
})

logger.stream = {
  // eslint-disable-next-line
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports
    logger.info(message)
  },
}

const getDuration = (start) => {
  const diff = process.hrtime(start)
  return diff[0] * 1e3 + diff[1] * 1e-6
}

logger.middleware = (req, res, next) => {
  if (!req.connection) {
    return next()
  }

  const reqStart = process.hrtime()
  const url = req.originalUrl || req.url

  // logger.info(`${req.method} ${url} ${req.connection.remoteAddress}:${req.connection.remotePort}`);

  res.on('finish', () => {
    const statusCode = res.statusCode || 200
    const level = statusCode < 400 ? 'info' : 'error'

    // eslint-disable-next-line
    logger[level](`${req.method} ${url} ${statusCode} ${getDuration(reqStart)}`);
  })

  next()
}

export default logger
