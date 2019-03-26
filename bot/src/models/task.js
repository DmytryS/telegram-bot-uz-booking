import mongoose from 'mongoose';

const statusTypes = {
  values: ['ACTIVE', 'COMPLETED', 'FAILED'],
  message: "Value must be either of 'ACTIVE', 'COMPLETED', 'FAILED'"
};

const { Schema } = mongoose;
const { ObjectId } = Schema;
const taskSchema = new Schema(
  {
    chatId: {
      type: String,
      required: true
    },
    userId: {
      type: ObjectId,
      required: true,
      ref: 'User'
    },
    departureStationId: {
      type: String,
      required: true
    },
    arrivalStationId: {
      type: String,
      required: true
    },
    departureDate: {
      type: Date,
      required: true
    },
    amountOfTickets: {
      type: Number,
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
  }
);

delete mongoose.connection.models.Task;

export default mongoose.model('Task', taskSchema);
