const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  scheme: {
    type: String,
    required: true,
    unique: true,
  },
  subjects: [
    {
      type: String,
      required: true,
    },
  ],
});

module.exports = mongoose.model("Scheme", userSchema);
