import mongoose from 'mongoose';
import logger from './logger.js';

const options = {
  useCreateIndex: true,
  useNewUrlParser: true
};

mongoose.Promise = Promise;

mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.MONGODB_URI, options);

mongoose.connection.on('connected', () => {
  logger.info('Connected to MongoDB');
});

mongoose.connection.on('error', error => {
  logger.error(`Connection to MongoDB failed: ${error.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Disconnected from MongoDB');
});

mongoose.connection.on('close', () => {
  logger.info('MongoDB connection closed');
});

export default mongoose;
