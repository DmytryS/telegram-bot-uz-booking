import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const userSchema = new Schema({
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

userSchema.index({ email: 1 }, { unique: true });

delete mongoose.connection.models.User;

export default mongoose.model('User', userSchema);
