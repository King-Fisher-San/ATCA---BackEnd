const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const baseOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [20, 'firstname must be less than or equal to 20'],
      minlength: [3, 'firstname must be greater than 3'],
      // unique: true,
      // required: [true, 'Please tell us your firstname!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    role: {
      type: String,
      enum: ['admin', 'qaManager', 'tester'],
      required: [true, `Please Provide Role`],
    },
    tests: {
      type: [
        {
          testName: {
            type: String,
          },
          projectName: {
            type: String,
          },
          id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
          status: {
            type: String,
            default: 'pending',
            enum: ['pending', 'Pass', 'Fail'],
          },
        },
      ],
      default: [],
    },
    language: {
      type: String,
    },
    level: {
      type: Number,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
      required: [true, 'Please provide a password'],
    },
    passwordConfirm: {
      type: String,
      validate: {
        // This only works on CREATE and SAVE!!!
        validator(el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
      // required: [true, 'Please confirm your password'],
    },
  },
  baseOptions
);

// Encrpt the password ad Presave it
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    //  only run if password is modified
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12); // hashing password
  this.passwordConfirm = undefined; // delete passwordConfirm field
  next();
});

// comparing password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  console.log(candidatePassword);
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
