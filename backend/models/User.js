const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      altitude: { type: Number, default: 0 },
      city: { type: String, default: '' },
    },
    preferences: {
      alertsEnabled: { type: Boolean, default: true },
      alertBeforeMinutes: { type: Number, default: 10 },
      minVisibilitySeconds: { type: Number, default: 60 },
      darkMode: { type: Boolean, default: true },
      satellites: { type: [String], default: ['ISS'] },
      speedUnit: { type: String, enum: ['kmh', 'mph'], default: 'kmh' },
      altitudeUnit: { type: String, enum: ['km', 'mi'], default: 'km' },
      temperatureUnit: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' },
      theme: { type: String, enum: ['dark', 'light', 'auto'], default: 'dark' },
      useGPS: { type: Boolean, default: true },
    },
    fcmToken: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: 'default-astronaut',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
