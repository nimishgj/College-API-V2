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
    deleteUser();
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const deleteUser = async () => {
  const user = await prompt([
    {
      type: "input",
      name: "name",
      message: "Enter the Name: ",
    },
  ]);
  try {
    const userExists = await Users.findOne({ name: user.name });
    if (userExists) {
      await Users.deleteOne({ name: user.name });
      console.log(`User "${user.name}" deleted successfully`);
    } else {
      console.log(`User "${user.name}" does not Exists.`);
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    mongoose.disconnect();
  }
};
