const mongoose = require('mongoose');

const baseOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const scenarioSchema = new mongoose.Schema(
  {
    action: String,
    inputs: String,
    expectedOutput: String,
    actualOutput: String,
    testResults: String,
    testComments: String,
  },
  baseOptions
);

const Scenario = mongoose.model('Scenario', scenarioSchema);
module.exports = Scenario;
