import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const sessionSchema = new Schema({
    session: {
        type: mongoose.Schema.Types.Mixed
    },
    key: {
        type: String,
        index: true
    }
},
{
    minimize: false
});

delete mongoose.connection.models.User;

export default mongoose.model('Session', sessionSchema);
