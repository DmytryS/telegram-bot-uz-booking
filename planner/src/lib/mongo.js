import mongoose from 'mongoose'
import logger from './logger.js'

const options = {
  useCreateIndex: true,
  useNewUrlParser: true
}

mongoose.Promise = Promise

mongoose.set('useFindAndModify', false)

mongoose.connect(process.env.MONGODB_URI, options)

mongoose.connection.on('connected', () => {
  logger.info('[MONGO] Connected to MongoDB')
})

mongoose.connection.on('error', error => {
  logger.error(`[MONGO] Connection to MongoDB failed: ${error.message}`)
})

mongoose.connection.on('disconnected', () => {
  logger.info(`[MONGO] Disconnected from ${process.env.MONGODB_URI}`)
})

mongoose.connection.on('close', () => {
  logger.info('[MONGO] Connection closed')
})

export default mongoose
