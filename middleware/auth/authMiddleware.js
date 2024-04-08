const jwt = require("jsonwebtoken");

const Users = require("../../models/User.model");
const { sendError } = require("../../util/Responses");

const { isValidObjectId } = require("mongoose");
const { log } = require("../logger/logger");

const { LOG_TYPE } = require("../../constants/LogType");

const { RESPONSE_MESSAGE } = require("../../constants/AuthMidlleware");

exports.protect = async (request, response, next) => {
  let token;
  try {
    token = request.cookies.jwt;
  } catch (error) {
    sendError(response, RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE, 401);
    log(
      request,
      RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE,
      "middleware/authMiddleware.js/protect",
      LOG_TYPE.REQUEST,
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
      return sendError(response, RESPONSE_MESSAGE.UNAUTHORIZED, 401);
    }

    const user = await Users.findOne({ _id: decoded.userId });

    if (!user) return sendError(response, RESPONSE_MESSAGE.INVALID_USER_ID, 404);

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
    sendError(response, RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE, 400);
    log(
      request,
      RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE,
      "middleware/authMiddleware.js/protect",
      LOG_TYPE.REQUEST,
      "error"
    );
  }
};

exports.protectAdminRotes = async (request, response, next) => {
  let token;
  try {
    token = request.cookies.jwt;
  } catch (error) {
    sendError(response, RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE, 401);
    log(
      request,
      RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE,
      "middleware/authMiddleware.js/protect",
      LOG_TYPE.REQUEST,
      "error"
    );
    return;
  }

  if (!token) {
    return sendError(response, RESPONSE_MESSAGE.LOGIN_AGAIN, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isValidObjectId(decoded.userId)) {
      return sendError(response, RESPONSE_MESSAGE.UNAUTHORIZED, 401);
    }

    const user = await Users.findOne({ _id: decoded.userId });

    if (!user)
      return sendError(response, RESPONSE_MESSAGE.INVALID_USER_ID, 404);

    if (user.isVerified === false)
      return sendError(response, RESPONSE_MESSAGE.VERIFY_EMAIL, 401);

    if (user.role !== "admin") {
      return sendError(response, RESPONSE_MESSAGE.UNAUTHORIZED, 401);
    }
    if (user._id != decoded.userId) {
      return sendError(response, "User Not Found", 404);
    }
    request.user = user;
    next();
  } catch (error) {
    sendError(response, RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE, 401);
    log(
      request,
      RESPONSE_MESSAGE.INVALID_TOKEN_MESSAGE,
      "middleware/authMiddleware.js/protect",
      LOG_TYPE.REQUEST,
      "error"
    );
  }
};
