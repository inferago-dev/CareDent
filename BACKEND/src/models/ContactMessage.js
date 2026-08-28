import mongoose from 'mongoose';
import { MESSAGE_STATUSES } from '../constants/domain.js';

const contactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true, default: 'General Enquiry' },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 4000 },
    status: { type: String, enum: MESSAGE_STATUSES, default: 'New', index: true },
    repliedAt: { type: Date },
    adminNotes: { type: String, trim: true },
    adminReply: {
      message: { type: String, trim: true, maxlength: 4000 },
      sentAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactSchema);
