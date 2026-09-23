import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/domain.js';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'],
    },
    /**
     * Absent on an account created through Google sign-in, which never had
     * one. `required` is therefore conditional rather than flat - and
     * comparePassword below refuses rather than throws when it is missing, so
     * a password login against a Google-only account fails as a wrong
     * password instead of a 500.
     */
    password: {
      type: String,
      minlength: 8,
      select: false,
      required: [function needsPassword() { return !this.googleId; }, 'Password is required'],
    },
    /**
     * The Google account's subject id, not its email. An email can be
     * reassigned within a Workspace domain; `sub` is stable and unique
     * forever, which is what makes it safe to key an identity on.
     */
    googleId: { type: String, index: true, sparse: true, unique: true },
    role: { type: String, enum: USER_ROLES, default: 'customer', index: true },
    phone: { type: String, trim: true },
    clinicName: { type: String, trim: true },
    city: { type: String, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    /**
     * When a password was last set, and by its presence whether there is one
     * at all. The hash itself is `select: false`, so it is absent from an
     * ordinary read and cannot answer that question; this field is always
     * loaded. Maintained by the pre-save hook, never written by hand.
     */
    passwordSetAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordSetAt = new Date();
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  // A Google-only account has no hash to compare against. Returning false
  // rather than letting bcrypt throw keeps the failure indistinguishable from
  // a wrong password, which is also what we want to tell the caller.
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function toPublic() {
  const { _id, name, email, role, phone, clinicName, city, address, createdAt } = this;
  return {
    id: _id, name, email, role, phone, clinicName, city, address, createdAt,
    // Lets the portal offer "set a password" to an account that signed up
    // through Google and has never had one, and hide the change-password form
    // that would otherwise ask for a current password that does not exist.
    // `passwordSetAt` only exists on accounts saved since it was added, so
    // fall back on the schema's own invariant: an account with no googleId
    // could not have been created without a password.
    hasPassword: Boolean(this.passwordSetAt) || !this.googleId,
    linkedGoogle: Boolean(this.googleId),
  };
};

export default mongoose.model('User', userSchema);
