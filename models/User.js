import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: false
});

const User = mongoose.model('User', UserSchema);

export default User;
