const jwt = require("jsonwebtoken");

const Users = require("../../models/User.model");
const { sendError } = require("../../util/Responses");

const { isValidObjectId } = require("mongoose");
const { log } = require("../logger/logger");

const RESPONSE_MESSAGE ={
  INVALID_TOKEN_MESSAGE:"Invalid:token Please Login to Continue" ,
  UNAUTHORIZED:"You are not authorized to access this route"
}

exports.protect = async (req, res, next) => {
  let token;
  try {
    token = req.cookies.jwt;
  } catch (error) {
    sendError(
      res,
      "Invalid Token Provided. Please Login again to continue",
      401
    );
    log(
      req,
      "Invalid Token Provided. Please Login again to continue",
      "middleware/authMiddleware.js/protect",
      "api request",
      "error"
    );
    return;
  }

  const role = req.body.role || req.params.role;

  if (!token) {
    return sendError(res, RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isValidObjectId(decoded.userId)) {
      return sendError(res, "Unautherised Access", 401);
    }

    const user = await Users.findOne({ _id: decoded.userId });

    if (!user) return sendError(res, "Invalid User Id Found", 404);

    if (role !== user.role) {
      return sendError(res, RESPONSE_MESSAGE.UNAUTHORIZED, 401);
    }
    if (user._id != decoded.userId) {
      return sendError(res, "User Not Found", 400);
    }
    req.user = {
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
      res,
      "Invalid Token Provided. Please Login again to continueee",
      400
    );
    log(
      req,
      "Invalid Token Provided. Please Login again to continue",
      "middleware/authMiddleware.js/protect",
      "api request",
      "error"
    );
  }
};

exports.protectAdminRotes = async (req, res, next) => {
  let token;
  try {
    token = req.cookies.jwt;
  } catch (error) {
    sendError(
      res,
      "Invalid Token Provided. Please Login again to continue",
      401
    );
    log(
      req,
      "Invalid Token Provided. Please Login again to continue",
      "middleware/authMiddleware.js/protect",
      "api request",
      "error"
    );
    return; // Stop execution here after sending the error response
  }

  if (!token) {
    return sendError(res, "Please Login to Continue", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isValidObjectId(decoded.userId)) {
      return sendError(res, "Unautherised Access", 401);
    }

    const user = await Users.findOne({ _id: decoded.userId });

    if (!user) return sendError(res, "Invalid User Id Found", 404);

    if (user.isVerified === false)
      return sendError(res, "Please Verify Your Email First", 401);

    if (user.role !== "admin") {
      return sendError(res, "You are not authorized to access this route", 401);
    }
    if (user._id != decoded.userId) {
      return sendError(res, "User Not Found", 404);
    }
    req.user = user;
    next();
  } catch (error) {
    sendError(
      res,
      "Invalid Token Provided. Please Login again to continueee",
      401
    );
    log(
      req,
      "Invalid Token Provided. Please Login again to continue",
      "middleware/authMiddleware.js/protect",
      "api request",
      "error"
    );
  }
};
