import mongoose from 'mongoose';

const statusTypes = {
    values: [ 'ACTIVE', 'COMPLETED', 'FAILED' ],
    message: 'Value must be either of \'ACTIVE\', \'COMPLETED\', \'FAILED\''
};

const Schema = mongoose.Schema;
const { ObjectId } = Schema;
const userSchema = new Schema({
    userId: {
        type: ObjectId,
        required: true,
        ref: 'User'
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
    },
    staus: {
        type: String,
        enum: statusTypes,
        required: true,
        default: 'ACTIVE'
    }
},
{
    timestamps: true
});

delete mongoose.connection.models.User;

export default mongoose.model('Task', userSchema);
