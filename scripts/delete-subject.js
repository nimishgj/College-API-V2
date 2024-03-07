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
    DeleteSubject();
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const DeleteSubject = async () => {
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
        schemeExists.subjects.splice(
          schemeExists.subjects.indexOf(scheme.subject),
          1
        );
        await schemeExists.save();
        console.log(
          `Subject "${scheme.subject}" deleted from Scheme "${scheme.scheme}" successfully`
        );
      } else {
        console.log(
          `Subject "${scheme.subject}" does not Exists in Scheme "${scheme.scheme}".`
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
