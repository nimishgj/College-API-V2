const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  logInfo: {
    type: String,
    required: [true, "Please provide a log"],
  },
  context: {
    type: String,
    required: [true, "Please provide a context"],
  },

  filename: {
    type: String,
    required: [true, "Please provide a filename"],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  type: {
    type: String,
    required: [true, "Please provide a type"],
  },
  level: {
    type: String,
    required: [true, "Please provide a level"],
  },
});

module.exports = mongoose.model("logs", logSchema);
