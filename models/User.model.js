const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: false,
    maxlength: [100, "Name cannot be more than 100 characters"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    trim: false,
    maxlength: [100, "Password cannot be more than 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    trim: false,
    unique: true,
    maxlength: [100, "Email cannot be more than 100 characters"],
  },
  role: {
    type: String,
    required: [true, "Please provide a role"],
    trim: false,
    maxlength: [100, "Role cannot be more than 100 characters"],
  },
  department: {
    type: String,
    required: [true, "Please provide a department"],
    trim: false,
    maxlength: [20, "Department cannot be more than 20 characters"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // Return here to prevent moving to the next middleware
  }
  console.log(123)
  const salt = await bcrypt.genSalt(10);
  console.log(123)
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Users", userSchema);
