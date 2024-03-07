const Scheme = require("../models/Scheme.model");
const Users = require("../models/User.model");

const { log } = require("../middleware/logger/logger");
const {
  sendError,
  sendInvalidParameterResponse,
  sendServerError,
} = require("../util/Responses");

exports.createScheme = async (req, res) => {
  try {
    const { scheme, subjects } = req.body;
    const userId = req.user._id.toString();
    if (!scheme || !subjects || !userId)
      return sendError(res, "Invalid Parameters Provided");

    const user = await Users.findById({ _id: userId });

    const newScheme = new Scheme({
      scheme,
      subjects,
    });
    await newScheme.save();
    log(
      req,
      `${user.name} Created Scheme ${scheme}`,
      "controllers/schemes.js/createScheme",
      "api request",
      "info"
    );
    res
      .status(200)
      .json({ success: true, message: "Succesfully created Scheme" });
  } catch (error) {
    log(
      req,
      `Error Occured While Creating Scheme ${scheme}`,
      "controllers/schemes.js/createScheme",
      "api request",
      "error"
    );
    sendServerError(res);
  }
};

exports.getSchemes = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const user = await Users.findById({ _id: userId });

    const schemes = await Scheme.find();
    log(
      req,
      `${user.name} Fetched All Schemes`,
      "controllers/schemes.js/getSchemes",
      "api request",
      "info"
    );
    res.status(200).json({ success: true, schemes });
  } catch (error) {
    log(
      req,
      `Error Occured While Fetching All Schemes`,
      "controllers/schemes.js/getSchemes",
      "api request",
      "error"
    );
    sendServerError(res);
  }
};

exports.deleteScheme = async (req, res) => {
  try {
    const { schemeId } = req.params;
    const userId = req.user._id.toString();
    if (!schemeId || !userId) return sendInvalidParameterResponse(res);
    const user = await Users.findById(userId);

    // Find the scheme by name
    const scheme = await Scheme.findOneAndDelete({ scheme: schemeId });

    if (!scheme) {
      return sendError(res, "Scheme Not Found");
    }

    log(
      req,
      `${user.name} Deleted Scheme ${schemeId}`,
      "controllers/schemes.js/deleteScheme",
      "api request",
      "info"
    );
    res
      .status(200)
      .json({ success: true, message: "Successfully Deleted Scheme" });
  } catch (error) {
    log(
      req,
      `Error Occured While Deleting Scheme ${schemeId}`,
      "controllers/schemes.js/deleteScheme",
      "api request",
      "error"
    );
    sendServerError(res);
  }
};

exports.checkScheme = async (currentScheme, currentSubject) => {
  const scheme = await Scheme.findOne({ scheme: currentScheme });

  if (scheme && scheme.subjects.includes(currentSubject)) {
    return true;
  }
  return false;
};

exports.addSubject = async (req, res) => {
  try {
    const { schemeId, subjectId } = req.body;
    const userId = req.user._id.toString();

    if (!schemeId || !subjectId || !userId)
      return sendInvalidParameterResponse(res);

    const user = await Users.findById({ _id: userId });

    const scheme = await Scheme.findOne({ scheme: schemeId });

    if (!scheme) return sendError(res, "Scheme Not Found");

    scheme.subjects.push(subjectId);
    await scheme.save();

    log(
      req,
      `${user.name} Added Subject ${subjectId} to Scheme ${schemeId}`,
      "controllers/schemes.js/addSubject",
      "api request",
      "info"
    );

    res
      .status(200)
      .json({ success: true, message: "Successfully Added Subject" });
  } catch (error) {
    log(
      req,
      `Error Occured While Adding Subject ${subjectId} to Scheme ${schemeId}`,
      "controllers/schemes.js/addSubject",
      "api request",
      "error"
    );
    sendServerError(res);
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user._id.toString();

    const schemeId = parseInt(req.params.schemeId);

    if (!schemeId || !subjectId || !userId)
      return sendInvalidParameterResponse(res);

    const user = await Users.findById({ _id: userId });

    if (!user) return sendError(res, "User Not Found");

    const scheme = await Scheme.findOne({ scheme: schemeId });

    if (!scheme) return sendError(res, "Scheme Not Found");

    scheme.subjects = scheme.subjects.filter(
      (subject) => subject !== subjectId
    );

    await scheme.save();

    log(
      req,
      `${user.name} Deleted Subject ${subjectId} from Scheme ${schemeId}`,
      "controllers/schemes.js/deleteSubject",
      "api request",
      "info"
    );

    res
      .status(200)
      .json({ success: true, message: "Successfully Deleted Subject" });
  } catch (error) {
    log(
      req,
      `Error Occured While Deleting Subject ${subjectId} from Scheme ${schemeId}`,
      "controllers/schemes.js/deleteSubject",
      "api request",
      "error"
    );
    sendServerError(res);
  }
};
