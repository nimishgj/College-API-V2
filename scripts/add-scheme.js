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
    createScheme();
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const createScheme = async () => {
  const scheme = new Scheme();
  const questions = [
    { type: "input", name: "scheme", message: "Enter the Scheme Year: " },
    {
      type: "input",
      name: "subjects",
      message: "Enter the Subjects Separated by commas: ",
    },
  ];
  const schemeDetails = await prompt(questions);
  scheme.scheme = schemeDetails.scheme;
  scheme.subjects = schemeDetails.subjects.split(",");
  try {
    await scheme.save();
    console.log(`Scheme ${scheme.scheme} created successfully`);
  } catch (error) {
    if (error.message.includes("duplicate key error")) {
      console.log(`Scheme "${scheme.scheme}" already Exists.`);
    } else console.log(error.message);
  } finally {
    mongoose.disconnect();
  }
};
