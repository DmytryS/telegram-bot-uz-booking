import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const userSchema = new Schema({
    telegramId: {
        type: String,
        unique: true,
        required: true
    },
    departureStationId: {
        type: String,
        required: true
    },
    targetStationId: {
        type: String,
        required: true
    },
    departureDate: {
        type: Date,
        required: true
    }
},
{
    timestamps: true
});

delete mongoose.connection.models.User;

export default mongoose.model('User', userSchema);
