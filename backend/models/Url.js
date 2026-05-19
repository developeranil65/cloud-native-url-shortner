import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  clickCount: {
    type: Number,
    required: true,
    default: 0,
  }
}, {
  timestamps: true // This will automatically create `createdAt` and `updatedAt`
});

const Url = mongoose.model('Url', urlSchema);

export default Url;
