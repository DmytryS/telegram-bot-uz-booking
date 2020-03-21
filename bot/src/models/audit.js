import mongoose from 'mongoose'

const { Schema, Types } = mongoose
const { ObjectId } = Types
const auditTypes = [
  'FIND_DIRECT_TICKETS', 'FIND_INTERCHAGE_TICKETS', 'SET_LANGUAGE',
  'WATCH_TICKETS', 'HELP', 'GET_WATCHERS', 'START', 'STOP_WATCH',
  'STOP', 'FIND_RETURN_TICKET', 'REMIND_WHEN_AVAILABLE'
]

const type = {
  values: auditTypes,
  message: `Status must be either of ${auditTypes.join(', ')}`
}
const auditSchema = new Schema(
  {
    user: {
      type: ObjectId,
      required: true,
      ref: 'User'
    },
    type: {
      type: String,
      enum: type,
    },
    departureStationId: {
      type: String,
    },
    departureStationName: {
      type: String,
    },
    arrivalStationId: {
      type: String,
    },
    arrivalStationName: {
      type: String,
    },
    departureDate: {
      type: Date,
    },
    departureTime: {
      type: String,
    },
  },
  {
    timestamps: true
  }
)

class Audit {
//   async stopBot() {
//     this.botEnabled = false

//     return this.save()
//   }
}

auditSchema.loadClass(Audit)

delete mongoose.connection.models.Audit

export default mongoose.model('Audit', auditSchema)
