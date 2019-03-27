import mongoose from 'mongoose';

const statusTypes = {
  values: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELED'],
  message:
    "Value must be either of 'ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELED'"
};

const { Schema } = mongoose;
const { ObjectId } = Schema;
const jobSchema = new Schema(
  {
    chatId: {
      type: String,
      required: true
    },
    user: {
      type: ObjectId,
      required: true,
      ref: 'User'
    },
    departureStationId: {
      type: String,
      required: true
    },
    departureStationName: {
      type: String,
      required: true
    },
    arrivalStationId: {
      type: String,
      required: true
    },
    arrivalStationName: {
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
    status: {
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

class Job {
  async markAsSucceded() {
    this.status = 'COMPLETED';
    return this.save();
  }

  async markAsExpired() {
    this.status = 'EXPIRED';
    return this.save();
  }

  async markAsCanceled() {
    this.status = 'CANCELED';
    return this.save();
  }
}

jobSchema.loadClass(Job);

delete mongoose.connection.models.Job;

export default mongoose.model('Job', jobSchema);
