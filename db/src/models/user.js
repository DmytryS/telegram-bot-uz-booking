
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const languages = {
    values: [ 'ru', 'en', 'uk' ],
    message: 'Language must be either of \'ru\', \'en\' or \'uk\''
};
const userSchema = new Schema({
    telegramId: { type: String, unique: true, required: true },
    phoneNumber: { type: String, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    userName: { type: String },
    language: { type: String, enum: languages, required: true, default: 'ru' }
}, {
    timestamps: true
});

delete mongoose.connection.models.User;

module.exports = mongoose.model('User', userSchema);
