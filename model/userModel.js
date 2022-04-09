const crypto = require('crypto');

const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'An email is required'],
    lowercase: true,
    unique: [true, 'A user with the email already existed!'],
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password must not be empty'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    // THis works ONLY on SAVE and CREATE
    validate: {
      validator: function (passwordConfirm) {
        return passwordConfirm === this.password;
      },
      message: 'Passwords do not match!!',
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

userSchema.pre('save', async function (next) {
  // Only runs if password is actually modified
  if (!this.isModified('password')) return next();
  this.password = await bcryptjs.hash(this.password, 13);

  //   Delete the password field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // the middleware is a query middleware and hence 'this' keyword points to the query
  this.find({ active: { $ne: false } });
  next();
});

// Creating a method on the user model

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  const newPassword = await bcryptjs.compare(candidatePassword, userPassword);

  return newPassword;
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = this.passwordChangedAt.getTime() / 1000;

    return changeTimeStamp > JWTTimestamp;
  }
  // false (is the default) which means NOT changed (i.e last time password was changed was less than the time token was issued)
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // The hashed token should be in the DB and not the original token because of data breach during DB hack
  console.log({ resetToken }, { passwordResetToken: this.passwordResetToken });
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
