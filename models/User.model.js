const mongoose = require("mongoose");
const argon2 = require('argon2');

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
  try {
    return await argon2.verify(this.password, enteredPassword);
  } catch (error) {
    throw error;
  }
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); 
  }
  try {
    this.password = await argon2.hash(this.password,10);
    next();
  } catch (error) {
    next(error);
  }
});
module.exports = mongoose.model("Users", userSchema);
