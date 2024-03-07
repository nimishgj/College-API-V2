require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const Admin = require("../models/admin.model");
const { prompt } = require("enquirer");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    createAdmin();
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const createAdmin = async () => {
  const admin = await prompt([
    {
      type: "input",
      name: "name",
      message: "Enter admin name",
    },
    {
      type: "input",
      name: "email",
      message: "Enter admin email",
    },
    {
      type: "password",
      name: "password",
      message: "Enter admin password",
    },
  ]);

  const newAdmin = new Admin(admin);

  try {
    await newAdmin.save();
    console.log(`Admin ${admin.name} created successfully`);
  } catch (error) {
    if (error.message.includes("duplicate key error")) {
      console.log(`Admin with "${admin.name}" is already Exists.`);
    } else console.log(error.message);
  } finally {
    mongoose.disconnect();
  }
};
