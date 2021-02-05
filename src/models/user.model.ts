import { Schema, Document, model, Query } from 'mongoose';

const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

export interface IUser extends Document {
  name: string;
  email: string;
  photo: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: number;
  active: boolean;
}

const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please tell us you name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must have less or equal then 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm you password'],
    validate: {
      // This only works on .save() .create()
      validator: function (this: IUser, val: string) {
        return val === this.password;
      },
      message: '"Password" and "Confirm password" must contain equal values',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre<IUser>('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // -1s to be sure that passwordChangedAt timestamp less then token.iat
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// query middleware
userSchema.pre<Query<IUser, IUser, any>>(/^find/, function () {
  this.find({ active: { $ne: false } });
});

// Methods are available on schema instances
userSchema.methods.correctPass = async function (
  candidatePass: string,
  userPass: string
) {
  return await bcrypt.compare(candidatePass, userPass);
};

userSchema.methods.changedPasswordAfter = function (
  this: IUser,
  JWTTimestamp: string
) {
  if (this.passwordChangedAt) {
    // divide by 1000 to convert ms in sec which jwt.iat is
    const changedTimestamp = parseInt(
      `${this.passwordChangedAt.getTime() / 1000}`,
      10
    );

    return +JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function (this: IUser) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 10 minutes limit for changing password
  this.passwordResetExpires = Date.now() + 10 * 60 * 1e3;

  // console.log(
  //   { resetToken },
  //   { token: this.passwordResetToken },
  //   { expin: this.passwordResetExpires }
  // );

  return resetToken;
};

export const User = model<IUser>('User', userSchema);

// for load/delete data script outside the module
// module.exports = User;
