import mongoose from 'mongoose';
import logger from './logger';

const dbLogger = logger.getLogger('DB');
const options = {
    useCreateIndex: true,
    useNewUrlParser: true
};

mongoose.Promise = Promise;

mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.MONGODB_URI, options);

mongoose.connection.on('connected', () => {
    dbLogger.info('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    dbLogger.error(`Connection to MongoDB failed: ${error.message}`);
});

mongoose.connection.on('disconnected', () => {
    dbLogger.info('Disconnected from MongoDB');
});

mongoose.connection.on('close', () => {
    dbLogger.info('MongoDB connection closed');
});

export default mongoose;
