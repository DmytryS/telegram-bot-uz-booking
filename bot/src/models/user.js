import mongoose from 'mongoose'

const { Schema } = mongoose
const languages = {
  values: ['en', 'ru', 'uk'],
  message: 'Status must be either of \'en\', \'ru\', \'uk\''
}
const userSchema = new Schema(
  {
    telegramId: {
      type: String,
      unique: true,
      required: true
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    userName: {
      type: String
    },
    language: {
      type: String,
      enum: languages,
      required: true,
      default: 'ru'
    },
    botEnabled: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    timestamps: true
  }
)

class User {
  async stopBot() {
    this.botEnabled = false

    return this.save()
  }
}

userSchema.loadClass(User)

delete mongoose.connection.models.User

export default mongoose.model('User', userSchema)
