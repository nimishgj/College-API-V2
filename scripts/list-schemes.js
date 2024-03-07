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
    listSchemes();
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const listSchemes = async () => {
  try {
    const schemes = await Scheme.find({});
    if (schemes.length > 0) {
      console.log("Schemes:");
      schemes.forEach((scheme) => {
        console.log(scheme.scheme);
      });
    } else {
      console.log("No Schemes Found.");
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    mongoose.disconnect();
  }
};
