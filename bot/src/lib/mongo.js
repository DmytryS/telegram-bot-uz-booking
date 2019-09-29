import mongoose from 'mongoose'
import logger from './logger.js'

const { MONGODB_URI } = process.env
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoIndex: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
}

mongoose.Promise = Promise

mongoose.set('useFindAndModify', false)

mongoose.connect(MONGODB_URI, options)

mongoose.connection.on('connected', () => {
  logger.info('[MONGO] Connected to MongoDB')
})

mongoose.connection.on('error', error => {
  logger.error(`[MONGO] Connection to MongoDB failed: ${error.message}`)
})

mongoose.connection.on('reconnected', () => {
  logger.error(`[MONGO] Reconnected to ${MONGODB_URI}`)
})

mongoose.connection.on('disconnected', () => {
  logger.info(`[MONGO] Disconnected from ${MONGODB_URI}`)
})

mongoose.connection.on('close', () => {
  logger.info('[MONGO] Connection closed')
})

export default mongoose
