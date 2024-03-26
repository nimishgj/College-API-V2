const jwt = require("jsonwebtoken");

const Users = require("../../models/User.model");
const { sendError } = require("../../util/Responses");

const { isValidObjectId } = require("mongoose");
const { log } = require("../logger/logger");

const RESPONSE_MESSAGE ={
  INVALID_TOKEN_MESSAGE:"Invalid:token Please Login to Continue" ,
  UNAUTHORIZED:"You are not authorized to access this route",
  INVALID_USER:"User Not Found"
}

const LOG_TYPE = {
  REQUEST: "API REQ",
  ERROR_GENERATION: "ERR GEN",
};

exports.protect = async (request, response, next) => {
  let token;
  try {
    token = request.cookies.jwt;
  } catch (error) {
    sendError(
      response,
      "Invalid Token Provided. Please Login again to continue",
      401
    );
    log(
      request,
      "Invalid Token Provided. Please Login again to continue",
      "middleware/authMiddleware.js/protect",
      "api request",
      "error"
    );
    return;
  }

  const role = request.body.role || request.params.role;

  if (!token) {
    return sendError(response, RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isValidObjectId(decoded.userId)) {
      return sendError(response, "Unautherised Access", 401);
    }

    const user = await Users.findOne({ _id: decoded.userId });

    if (!user) return sendError(response, "Invalid User Id Found", 404);

    if (role !== user.role) {
      return sendError(response, RESPONSE_MESSAGE.UNAUTHORIZED, 401);
    }
    if (user._id != decoded.userId) {
      return sendError(response, RESPONSE_MESSAGE.INVALID_USER, 400);
    }
    request.user = {
      _id: decoded.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    };
    next();
  } catch (error) {
    console.log(error);
    sendError(
      response,
      RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE,
      400
    );
    log(
      request,
      RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE,
      "middleware/authMiddleware.js/protect",
      "api request",
      "error"
    );
  }
};

exports.protectAdminRotes = async (request, response, next) => {
  let token;
  try {
    token = request.cookies.jwt;
  } catch (error) {
    sendError(
      response,
      RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE,
      401
    );
    log(
      request,
      RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE,
      "middleware/authMiddleware.js/protect",
      "api request",
      "error"
    );
    return; // Stop execution here after sending the error response
  }

  if (!token) {
    return sendError(response, "Please Login to Continue", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isValidObjectId(decoded.userId)) {
      return sendError(response, "Unautherised Access", 401);
    }

    const user = await Users.findOne({ _id: decoded.userId });

    if (!user) return sendError(response, "Invalid User Id Found", 404);

    if (user.isVerified === false)
      return sendError(response, "Please Verify Your Email First", 401);

    if (user.role !== "admin") {
      return sendError(response, "You are not authorized to access this route", 401);
    }
    if (user._id != decoded.userId) {
      return sendError(response, "User Not Found", 404);
    }
    request.user = user;
    next();
  } catch (error) {
    sendError(
      response,
      RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE,
      401
    );
    log(
      request,
      RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE,
      "middleware/authMiddleware.js/protect",
      "api request",
      "error"
    );
  }
};
