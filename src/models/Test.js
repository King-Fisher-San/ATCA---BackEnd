const mongoose = require('mongoose');

const baseOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const testSchema = new mongoose.Schema(
  {
    name: String,
    language: String,
    preRequiste: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
    },
    difficultyLevel: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },
    BoxType: {
      type: String,
    },
    assigned: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
      },
    },
    status:{
      type: String,
      default: 'pending',
      enum: ['pending', 'Pass', 'Fail'],
    },
    scenarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scenario' }],
  },
  baseOptions
);

testSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'scenarios',
  });
  next();
});

const Test = mongoose.model('Test', testSchema);
module.exports = Test;
