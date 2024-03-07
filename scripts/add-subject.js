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
    AddSubject();
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const AddSubject = async () => {
  const scheme = await prompt([
    {
      type: "input",
      name: "scheme",
      message: "Enter the Scheme Year: ",
    },
    {
      type: "input",
      name: "subject",
      message: "Enter the Subject: ",
    },
  ]);
  try {
    const schemeExists = await Scheme.findOne({ scheme: scheme.scheme });
    if (schemeExists) {
      if (schemeExists.subjects.includes(scheme.subject)) {
        console.log(
          `Subject "${scheme.subject}" already Exists in Scheme "${scheme.scheme}".`
        );
      } else {
        schemeExists.subjects.push(scheme.subject);
        await schemeExists.save();
        console.log(
          `Subject "${scheme.subject}" added to Scheme "${scheme.scheme}" successfully`
        );
      }
    } else {
      console.log(`Scheme "${scheme.scheme}" does not Exists.`);
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    mongoose.disconnect();
  }
};
