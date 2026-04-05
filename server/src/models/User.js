import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String, required: true, unique: true,
    trim: true, minlength: 2, maxlength: 20
  },
  passwordHash: { type: String, required: true },
  createdAt:    { type: Date, default: Date.now },
  lastLoginAt:  { type: Date, default: Date.now },
  settings: {
    cookTimeMultiplier: { type: Number, default: 1.0, min: 0.1, max: 1.0 },
    soundEnabled:       { type: Boolean, default: true },
    musicEnabled:       { type: Boolean, default: true }
  }
});

export default mongoose.model('User', UserSchema);
