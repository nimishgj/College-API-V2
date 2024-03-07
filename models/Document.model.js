const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
    maxlength: [20, "Name cannot be more than 20 characters"],
  },
  filename: {
    type: String,
    required: [true, "Please provide a filename"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: String,
    required: [true, "Please provide a user"],
    trim: true,
    maxlength: [20, "User cannot be more than 20 characters"],
  },
  subject: {
    type: String,
    required: [true, "Please provide a subject"],
    trim: true,
    maxlength: [20, "Subject cannot be more than 20 characters"],
  },
  scheme: {
    type: String,
    required: [true, "Please provide a scheme"],
    trim: true,
    maxlength: [20, "Scheme cannot be more than 20 characters"],
  },
  fileUrl: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("documents", documentSchema);
