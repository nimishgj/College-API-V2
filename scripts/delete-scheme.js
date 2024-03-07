require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const Scheme = require("../models/Scheme.model");
const { prompt } = require("enquirer");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    DeleteScheme();
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const DeleteScheme = async () => {
  const scheme = await prompt([
    {
      type: "input",
      name: "scheme",
      message: "Enter the Scheme Year: ",
    },
  ]);
  try {
    const schemeExists = await Scheme.findOne({ scheme: scheme.scheme });
    if (schemeExists) {
      await Scheme.deleteOne({ scheme: scheme.scheme });
      console.log(`Scheme "${scheme.scheme}" deleted successfully`);
    } else {
      console.log(`Scheme "${scheme.scheme}" does not Exists.`);
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    mongoose.disconnect();
  }
};
