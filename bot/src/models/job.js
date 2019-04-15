import mongoose from 'mongoose';

const statusTypes = {
  values: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELED', 'FAILED'],
  message:
    "Value must be either of 'ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELED', 'FAILED'"
};

const ticketTypes = {
  values: [
    'BERTH',
    'DE_LUXE',
    'COMPARTMENT',
    'SEATING_1ST_CLASS',
    'SEATING_2ND_CLASS',
    'SEATING_3D_CLASS'
  ],
  message:
    "Value must be either of 'BERTH', 'DE_LUXE', 'COMPARTMENT', 'SEATING_1ST_CLASS', 'SEATING_2ND_CLASS' ,'SEATING_3D_CLASS'"
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
    ticketTypes: [
      {
        type: String,
        enum: ticketTypes,
        required: true
      }
    ],
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

  async markAsFailed() {
    this.status = 'FAILED';

    return this.save();
  }

  isActive() {
    return this.status === 'ACTIVE';
  }

  static async markAsCanceledForUser(userId) {
    return this.update(
      {
        'user._id': ObjectId(userId),
        status: 'ACTIVE'
      },
      {
        status: 'CANCELED'
      }
    );
  }
}

jobSchema.loadClass(Job);

delete mongoose.connection.models.Job;

export default mongoose.model('Job', jobSchema);
