import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: [
      function() {
        return !this.isGoogleUser;
      },
      'Mobile number is required'
    ],
    trim: true
  },
  password: {
    type: String,
    required: [
      function() {
        return !this.isGoogleUser;
      },
      'Password is required'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model('User', userSchema)
export default User
