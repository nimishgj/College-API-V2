const Scheme = require("../models/Scheme.model");
const Users = require("../models/User.model");

const { log } = require("../middleware/logger/logger");
const {
  sendError,
  sendInvalidParameterResponse,
  sendServerError,
} = require("../util/Responses");

exports.createScheme = async (request, response) => {
  try {
    const { scheme, subjects } = request.body;
    const userId = request.user._id.toString();
    if (!scheme || !subjects || !userId)
      return sendError(response, "Invalid Parameters Provided");

    const user = await Users.findById({ _id: userId });

    const newScheme = new Scheme({
      scheme,
      subjects,
    });
    await newScheme.save();
    log(
      request,
      `${user.name} Created Scheme ${scheme}`,
      "controllers/schemes.js/createScheme",
      "api request",
      "info"
    );
    response
      .status(200)
      .json({ success: true, message: "Succesfully created Scheme" });
  } catch (error) {
    log(
      request,
      `Error Occured While Creating Scheme ${scheme}`,
      "controllers/schemes.js/createScheme",
      "api request",
      "error"
    );
    sendServerError(response);
  }
};

exports.getSchemes = async (request, response) => {
  try {
    const userId = request.user._id.toString();
    const user = await Users.findById({ _id: userId });

    const schemes = await Scheme.find();
    log(
      request,
      `${user.name} Fetched All Schemes`,
      "controllers/schemes.js/getSchemes",
      "api request",
      "info"
    );
    response.status(200).json({ success: true, schemes });
  } catch (error) {
    log(
      request,
      `Error Occured While Fetching All Schemes`,
      "controllers/schemes.js/getSchemes",
      "api request",
      "error"
    );
    sendServerError(response);
  }
};

exports.deleteScheme = async (request, response) => {
  try {
    const { schemeId } = request.params;
    const userId = request.user._id.toString();
    if (!schemeId || !userId) return sendInvalidParameterResponse(response);
    const user = await Users.findById(userId);

    // Find the scheme by name
    const scheme = await Scheme.findOneAndDelete({ scheme: schemeId });

    if (!scheme) {
      return sendError(response, "Scheme Not Found");
    }

    log(
      request,
      `${user.name} Deleted Scheme ${schemeId}`,
      "controllers/schemes.js/deleteScheme",
      "api request",
      "info"
    );
    response
      .status(200)
      .json({ success: true, message: "Successfully Deleted Scheme" });
  } catch (error) {
    log(
      request,
      `Error Occured While Deleting Scheme ${schemeId}`,
      "controllers/schemes.js/deleteScheme",
      "api request",
      "error"
    );
    sendServerError(response);
  }
};

exports.checkScheme = async (currentScheme, currentSubject) => {
  const scheme = await Scheme.findOne({ scheme: currentScheme });

  if (scheme && scheme.subjects.includes(currentSubject)) {
    return true;
  }
  return false;
};

exports.addSubject = async (request, response) => {
  try {
    const { schemeId, subjectId } = request.body;
    const userId = request.user._id.toString();

    if (!schemeId || !subjectId || !userId)
      return sendInvalidParameterResponse(response);

    const user = await Users.findById({ _id: userId });

    const scheme = await Scheme.findOne({ scheme: schemeId });

    if (!scheme) return sendError(response, "Scheme Not Found");

    scheme.subjects.push(subjectId);
    await scheme.save();

    log(
      request,
      `${user.name} Added Subject ${subjectId} to Scheme ${schemeId}`,
      "controllers/schemes.js/addSubject",
      "api request",
      "info"
    );

    response
      .status(200)
      .json({ success: true, message: "Successfully Added Subject" });
  } catch (error) {
    log(
      request,
      `Error Occured While Adding Subject ${subjectId} to Scheme ${schemeId}`,
      "controllers/schemes.js/addSubject",
      "api request",
      "error"
    );
    sendServerError(response);
  }
};

exports.deleteSubject = async (request, response) => {
  try {
    const { subjectId } = request.params;
    const userId = request.user._id.toString();

    const schemeId = parseInt(request.params.schemeId);

    if (!schemeId || !subjectId || !userId)
      return sendInvalidParameterResponse(response);

    const user = await Users.findById({ _id: userId });

    if (!user) return sendError(response, "User Not Found");

    const scheme = await Scheme.findOne({ scheme: schemeId });

    if (!scheme) return sendError(response, "Scheme Not Found");

    scheme.subjects = scheme.subjects.filter(
      (subject) => subject !== subjectId
    );

    await scheme.save();

    log(
      request,
      `${user.name} Deleted Subject ${subjectId} from Scheme ${schemeId}`,
      "controllers/schemes.js/deleteSubject",
      "api request",
      "info"
    );

    response
      .status(200)
      .json({ success: true, message: "Successfully Deleted Subject" });
  } catch (error) {
    log(
      request,
      `Error Occured While Deleting Subject ${subjectId} from Scheme ${schemeId}`,
      "controllers/schemes.js/deleteSubject",
      "api request",
      "error"
    );
    sendServerError(response);
  }
};
