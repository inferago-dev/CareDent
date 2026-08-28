import mongoose from 'mongoose';
import { TICKET_STATUSES, SERVICE_TYPES, PRIORITIES } from '../constants/domain.js';

// Floor plans and room photos a clinic attaches to a site-assessment request.
const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String, trim: true },
    size: { type: Number, default: 0 },
    mimeType: { type: String, trim: true },
  },
  { _id: false }
);

// Only populated for 'Pre-Installation Site Visit' tickets.
const siteAssessmentSchema = new mongoose.Schema(
  {
    location: { type: String, trim: true },
    roomLength: { type: String, trim: true },
    roomWidth: { type: String, trim: true },
    ceilingHeight: { type: String, trim: true },
    preferredDate: { type: Date },
  },
  { _id: false }
);

const updateSchema = new mongoose.Schema(
  {
    status: { type: String, enum: TICKET_STATUSES, required: true },
    note: { type: String, trim: true },
    by: { type: String, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    clinicName: { type: String, trim: true },
    contactName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },

    equipment: { type: String, required: [true, 'Tell us which equipment needs service'], trim: true },
    serialNumber: { type: String, trim: true },
    serviceType: {
      type: String,
      enum: SERVICE_TYPES,
      default: 'Breakdown Repair',
    },
    siteAssessment: siteAssessmentSchema,
    attachments: [attachmentSchema],
    issue: { type: String, required: [true, 'Describe the issue'], trim: true, maxlength: 2000 },
    priority: { type: String, enum: PRIORITIES, default: 'Medium', index: true },

    status: { type: String, enum: TICKET_STATUSES, default: 'Open', index: true },
    updates: [updateSchema],

    assignedEngineer: { type: String, trim: true },
    scheduledFor: { type: Date },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

ticketSchema.pre('save', function seedTimeline(next) {
  if (this.isNew && this.updates.length === 0) {
    this.updates.push({ status: this.status, note: 'Request received' });
  }
  next();
});

export default mongoose.model('ServiceTicket', ticketSchema);
