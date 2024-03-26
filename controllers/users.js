const Users = require("../models/User.model");
const userVerification = require("../models/UserVerification.model");
const {
  sendError,
  sendInvalidParameterResponse,
  sendServerError,
} = require("../util/Responses");
const { generateOtp, mailTransport } = require("../util/mails/mail");
const { log } = require("../middleware/logger/logger");

const { deleteDocumentByUserName } = require("./documents");
const { generateToken } = require("../util/generateToken");

exports.validateUser = async (userId) => {
  const user = await Users.findById(userId);

  if (!user) return false;

  if (user) return user;
};

exports.createUser = async (request, response) => {
  try {
    const { name, email, password, department, role } = request.body;

    if (!name || !email || !password || !department || !role)
      return sendInvalidParameterResponse(response);

    if (!email.endsWith("git.edu"))
      return sendError(response, "Please Enter the College Email ID");

    //TODO: check for Password Strength
    const userName = await Users.findOne({ name: name });
    if (userName) return sendError(response, "Name Already Exists");

    const user = await Users.findOne({ email });
    if (user) return sendError(response, "The email already exists.");
    const newUser = new Users({
      name,
      email,
      password,
      department,
      role,
    });

    if (newUser.role == "student") {
      newUser.isVerified = true;
    }

    if (newUser) {
      generateToken(response, newUser._id);
    } else {
      return sendError(response, "Some error occured while creating user");
    }

    const OTP = generateOtp();

    const verificationToken = new userVerification({
      owner: newUser._id,
      token: OTP,
    });

    await verificationToken.save();

    log(
      request,
      `${newUser.name} Generated New Verification Token with ObjectID ${verificationToken._id} for Account Verification`,
      "controllers/users.js/createUser",
      "sign up",
      "info"
    );

    mailTransport().sendMail(
      {
        from: "test.mail.nimish@gmail.com",
        to: newUser.email,
        subject: "Verify your email account",
        html: `<h1>${OTP}</h1>`,
      },
      (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("sent");
          console.log(info.response);
        }
      }
    );

    await newUser.save();

    log(
      request,
      `${newUser.name} Created an Unverified Account`,
      "controllers/users.js/createUser",
      "sign up",
      "info"
    );

    response.send({
      success: true,
      message: "User Created Successfully.Please Verify your Email",
    });
  } catch (error) {
    console.log(error);
    log(
      request,
      `Error Occured While Creating User`,
      "controllers/users.js/createUser",
      "sign up",
      "error"
    );

    sendServerError(response);
  }
};

exports.verifyEmail = async (request, response) => {
  try {
    const { token } = request.body;
    const userId = request.user._id;

    if (!userId || !token) return sendInvalidParameterResponse(response);

    const user = await Users.findById(userId);
    if (!user) return sendError(response, "No such user found.");

    if (user.isVerified)
      return sendError(response, "This account is already verified");

    const verificationToken = await userVerification.findOne({
      owner: userId,
      token,
    });
    if (!verificationToken) return sendError(response, "Invalid Token");

    user.isVerified = true;
    await user.save();
    await userVerification.findByIdAndDelete(verificationToken._id);

    log(
      request,
      `${user.name} Verified their Email`,
      "controllers/users.js/verifyEmail",
      "sign up",
      "info"
    );
    response.send({
      success: true,
      message: "Account Verified Please Login to Continue",
      role: user.role,
    });
  } catch (error) {
    log(
      request,
      `Error Occured While Verifying Email`,
      "controllers/users.js/verifyEmail",
      "sign up",
      "error"
    );
    sendServerError(response);
  }
};

exports.login = async (request, response) => {
  try {
    let { email, password, role } = request.body;

    if (!email || !password || !role) return sendInvalidParameterResponse(response);

    const user = await Users.findOne({ email });
    if (!user) return sendError(response, "Invalid email");
    if (!(await user.matchPassword(password))) {
      return sendError(response, "Invalid password");
    } else {
      if (user.role != role) return sendError(response, "Invalid Role");

      if (!user.isVerified) return sendError(response, "Please verify your email");
      generateToken(response, user._id);
      await log(
        request,
        `${user.name} Logged In`,
        "controllers/users.js/login",
        "sign in",
        "info"
      );

      response.json({
        success: true,
        message: "Login Successful",
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  } catch (error) {
    log(
      request,
      `Error Occured While Logging In`,
      "controllers/users.js/login",
      "sign in",
      "error"
    );
    sendServerError(response);
  }
};

exports.logout = (request, response) => {
  try {
    response.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    log(
      request,
      `${request.user.name} Logged Out`,
      "controllers/users.js/logout",
      "sign out",
      "info"
    );
    response.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    log(
      request,
      `Error Occured While Logging Out`,
      "controllers/users.js/logout",
      "sign out",
      "error"
    );
    sendServerError(response);
  }
};

exports.changePasswordRequest = async (request, response) => {
  try {
    const userId = request.user._id.toString();

    const user = await Users.findById(userId);

    const OTP = generateOtp();
    const verificationToken = new userVerification({
      owner: userId,
      token: OTP,
    });

    await verificationToken.save();

    log(
      request,
      `${user.name} Generated New Verification Token with ObjectID ${verificationToken._id} for Password Reset`,
      "controllers/users.js/changePasswordRequest",
      "api request",
      "info"
    );

    mailTransport().sendMail(
      {
        from: "test.mail.nimish@gmail.com",
        to: user.email,
        subject: "Verify your email account",
        html: `<h1>${OTP} for Password Reset</h1>`,
      },
      (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("sent");
          console.log(info.response);
        }
      }
    );
    response
      .status(200)
      .json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    log(
      request,
      `Error Occured While Generating Verification Token for Password Reset`,
      "controllers/users.js/changePasswordRequest",
      "api request",
      "error"
    );
    sendServerError(response);
  }
};

exports.changePassword = async (request, response) => {
  try {
    const { token, password } = request.body;
    const userId = request.user._id.toString();

    if (!userId || !token || !password)
      return sendInvalidParameterResponse(response);

    const user = await Users.findById(userId);

    const verificationToken = await userVerification.findOne({
      owner: userId,
      token,
    });
    if (!verificationToken) return sendError(response, "Invalid Token");

    user.password = password;
    await user.save();
    await userVerification.findByIdAndDelete(verificationToken._id);

    log(
      request,
      `${user.name} changed their password`,
      "controllers/users.js/changePassword",
      "api request",
      "info"
    );
    response.send({ success: true, message: "Password Reset Successfully" });
  } catch (error) {
    log(
      request,
      `Error Occured While Changing Password`,
      "controllers/users.js/changePassword",
      "api request",
      "error"
    );
    sendServerError(response);
  }
};

exports.forgotPasswordRequest = async (request, response) => {
  try {
    const { email } = request.body;

    if (!email) return sendInvalidParameterResponse(response);

    const user = await Users.findOne({ email });
    if (!user) return sendError(response, "User not registered.");

    const OTP = generateOtp();

    const verificationToken = new userVerification({
      owner: user._id,
      token: OTP,
    });

    await verificationToken.save();

    log(
      request,
      `${user.name} Generated New Verification Token with ObjectID ${verificationToken._id} for Forgot Password`,
      "controllers/users.js/forgotPasswordRequest",
      "api request",
      "info"
    );

    mailTransport().sendMail(
      {
        from: "test.mail.nimish@gmail.com",
        to: user.email,
        subject: "Verify your email account",
        html: `<h1>${OTP} for Forgot Password</h1>`,
      },
      (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("sent");
          console.log(info.response);
        }
      }
    );
    response.status(200).json({
      success: true,
      message: "Email sent successfully for Password Reset.",
    });
  } catch (error) {
    log(
      request,
      `Error Occured While Generating Verification Token for Forgot Password`,
      "controllers/users.js/forgotPasswordRequest",
      "api request",
      "error"
    );
    sendServerError(response);
  }
};

exports.forgotPassword = async (request, response) => {
  try {
    const { email, token, password } = request.body;

    if (!email || !token || !password) return sendInvalidParameterResponse(response);

    const user = await Users.findOne({ email });
    if (!user) return sendError(response, "No such user found.");

    const verificationToken = await userVerification.findOne({
      owner: user._id,
      token,
    });
    if (!verificationToken) return sendError(response, "Invalid Token");

    user.password = password;
    await user.save();
    await userVerification.findByIdAndDelete(verificationToken._id);

    log(
      request,
      `${user.name} changed their password`,
      "controllers/users.js/forgotPassword",
      "api request",
      "info"
    );

    response.send({
      success: true,
      message: "Password Reset Succesfull.Please Login Again",
    });
  } catch (error) {
    log(
      request,
      `Error Occured While Changing Password`,
      "controllers/users.js/forgotPassword",
      "api request",
      "error"
    );
    sendServerError(response);
  }
};

exports.deleteUser = async (request, response) => {
  try {
    const { deleteDocuments } = request.params;
    const userId = request.user._id.toString();

    if (!userId || !deleteDocuments) return sendInvalidParameterResponse(response);

    const user = await Users.findById(userId);

    await Users.findByIdAndDelete(userId);

    if (deleteDocuments == true) {
      if (!deleteDocumentByUserName(user.name)) {
        log(
          request,
          `Error Occured While Deleting Documents of ${user.name}`,
          "controllers/users.js/deleteUser",
          "api request",
          "error"
        );

        return sendError(
          response,
          "Some error occured while deleting documents Please Delete them after Some time"
        );
      }
    }

    log(
      request,
      `${user.name} Deleted their Account`,
      "controllers/users.js/deleteUser",
      "api request",
      "info"
    );
    response.send({ success: true, message: "User Successfully Deleted" });
  } catch (error) {
    log(
      request,
      `Error Occured While Deleting User`,
      "controllers/users.js/deleteUser",
      "api request",
      "error"
    );
    sendServerError(response);
  }
};
