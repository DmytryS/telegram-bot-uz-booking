import mongoose from 'mongoose';

const url = `${process.env.MONGO_URL}/${process.env.DB_NAME}`;
const options = {
    useCreateIndex: true,
    useNewUrlParser: true
};

mongoose.Promise = Promise;

mongoose.set('useFindAndModify', false);

mongoose.connect(url, options);

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.log(`Connection to MongoDB failed: ${error.message}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

mongoose.connection.on('close', () => {
    console.log('MongoDB connection closed');
});

export default mongoose;
