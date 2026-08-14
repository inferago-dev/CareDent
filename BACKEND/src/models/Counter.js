import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  scope: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model('Counter', counterSchema);
