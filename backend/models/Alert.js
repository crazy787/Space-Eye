const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    satelliteId: {
      type: Number,
      required: true,
      default: 25544, // ISS
    },
    satelliteName: {
      type: String,
      default: 'ISS (ZARYA)',
    },
    passData: {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      duration: { type: Number, required: true }, // seconds
      maxElevation: { type: Number }, // degrees
      startAzimuth: { type: Number },
      startAzimuthCompass: { type: String }, // e.g., "NW"
      endAzimuth: { type: Number },
      endAzimuthCompass: { type: String }, // e.g., "SE"
      magnitude: { type: Number }, // brightness
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    notified: {
      type: Boolean,
      default: false,
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'notified', 'viewed', 'expired'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
alertSchema.index({ user: 1, 'passData.startTime': 1 });
alertSchema.index({ status: 1, 'passData.startTime': 1 });

module.exports = mongoose.model('Alert', alertSchema);
