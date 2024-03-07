require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const Users = require("../models/User.model");
const { prompt } = require("enquirer");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    ListUsers();
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const ListUsers = async () => {
  try {
    const users = await Users.find({});
    if (users.length > 0) {
      console.log("Users:");
      users.forEach((user) => {
        console.log(user.name);
      });
    } else {
      console.log("No Users Found.");
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    mongoose.disconnect();
  }
};
