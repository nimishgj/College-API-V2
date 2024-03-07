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

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    if (!name || !email || !password || !department || !role)
      return sendInvalidParameterResponse(res);

    if (!email.endsWith("git.edu"))
      return sendError(res, "Please Enter the College Email ID");

    //TODO: check for Password Strength
    const userName = await Users.findOne({ name: name });
    if (userName) return sendError(res, "Name Already Exists");

    const user = await Users.findOne({ email });
    if (user) return sendError(res, "The email already exists.");
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
      generateToken(res, newUser._id);
    } else {
      return sendError(res, "Some error occured while creating user");
    }

    const OTP = generateOtp();

    const verificationToken = new userVerification({
      owner: newUser._id,
      token: OTP,
    });

    await verificationToken.save();

    log(
      req,
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
      req,
      `${newUser.name} Created an Unverified Account`,
      "controllers/users.js/createUser",
      "sign up",
      "info"
    );

    res.send({
      success: true,
      message: "User Created Successfully.Please Verify your Email",
    });
  } catch (error) {
    console.log(error);
    log(
      req,
      `Error Occured While Creating User`,
      "controllers/users.js/createUser",
      "sign up",
      "error"
    );

    sendServerError(res);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    if (!userId || !token) return sendInvalidParameterResponse(res);

    const user = await Users.findById(userId);
    if (!user) return sendError(res, "No such user found.");

    if (user.isVerified)
      return sendError(res, "This account is already verified");

    const verificationToken = await userVerification.findOne({
      owner: userId,
      token,
    });
    if (!verificationToken) return sendError(res, "Invalid Token");

    user.isVerified = true;
    await user.save();
    await userVerification.findByIdAndDelete(verificationToken._id);

    log(
      req,
      `${user.name} Verified their Email`,
      "controllers/users.js/verifyEmail",
      "sign up",
      "info"
    );
    res.send({
      success: true,
      message: "Account Verified Please Login to Continue",
      role: user.role,
    });
  } catch (error) {
    log(
      req,
      `Error Occured While Verifying Email`,
      "controllers/users.js/verifyEmail",
      "sign up",
      "error"
    );
    sendServerError(res);
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password, role } = req.body;

    if (!email || !password || !role) return sendInvalidParameterResponse(res);

    const user = await Users.findOne({ email });
    if (!user) return sendError(res, "Invalid email");
    if (!(await user.matchPassword(password))) {
      return sendError(res, "Invalid password");
    } else {
      if (user.role != role) return sendError(res, "Invalid Role");

      if (!user.isVerified) return sendError(res, "Please verify your email");
      generateToken(res, user._id);
      await log(
        req,
        `${user.name} Logged In`,
        "controllers/users.js/login",
        "sign in",
        "info"
      );

      res.json({
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
      req,
      `Error Occured While Logging In`,
      "controllers/users.js/login",
      "sign in",
      "error"
    );
    sendServerError(res);
  }
};

exports.logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    log(
      req,
      `${req.user.name} Logged Out`,
      "controllers/users.js/logout",
      "sign out",
      "info"
    );
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    log(
      req,
      `Error Occured While Logging Out`,
      "controllers/users.js/logout",
      "sign out",
      "error"
    );
    sendServerError(res);
  }
};

exports.changePasswordRequest = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const user = await Users.findById(userId);

    const OTP = generateOtp();
    const verificationToken = new userVerification({
      owner: userId,
      token: OTP,
    });

    await verificationToken.save();

    log(
      req,
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
    res
      .status(200)
      .json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    log(
      req,
      `Error Occured While Generating Verification Token for Password Reset`,
      "controllers/users.js/changePasswordRequest",
      "api request",
      "error"
    );
    sendServerError(res);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const userId = req.user._id.toString();

    if (!userId || !token || !password)
      return sendInvalidParameterResponse(res);

    const user = await Users.findById(userId);

    const verificationToken = await userVerification.findOne({
      owner: userId,
      token,
    });
    if (!verificationToken) return sendError(res, "Invalid Token");

    user.password = password;
    await user.save();
    await userVerification.findByIdAndDelete(verificationToken._id);

    log(
      req,
      `${user.name} changed their password`,
      "controllers/users.js/changePassword",
      "api request",
      "info"
    );
    res.send({ success: true, message: "Password Reset Successfully" });
  } catch (error) {
    log(
      req,
      `Error Occured While Changing Password`,
      "controllers/users.js/changePassword",
      "api request",
      "error"
    );
    sendServerError(res);
  }
};

exports.forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return sendInvalidParameterResponse(res);

    const user = await Users.findOne({ email });
    if (!user) return sendError(res, "User not registered.");

    const OTP = generateOtp();

    const verificationToken = new userVerification({
      owner: user._id,
      token: OTP,
    });

    await verificationToken.save();

    log(
      req,
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
    res.status(200).json({
      success: true,
      message: "Email sent successfully for Password Reset.",
    });
  } catch (error) {
    log(
      req,
      `Error Occured While Generating Verification Token for Forgot Password`,
      "controllers/users.js/forgotPasswordRequest",
      "api request",
      "error"
    );
    sendServerError(res);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) return sendInvalidParameterResponse(res);

    const user = await Users.findOne({ email });
    if (!user) return sendError(res, "No such user found.");

    const verificationToken = await userVerification.findOne({
      owner: user._id,
      token,
    });
    if (!verificationToken) return sendError(res, "Invalid Token");

    user.password = password;
    await user.save();
    await userVerification.findByIdAndDelete(verificationToken._id);

    log(
      req,
      `${user.name} changed their password`,
      "controllers/users.js/forgotPassword",
      "api request",
      "info"
    );

    res.send({
      success: true,
      message: "Password Reset Succesfull.Please Login Again",
    });
  } catch (error) {
    log(
      req,
      `Error Occured While Changing Password`,
      "controllers/users.js/forgotPassword",
      "api request",
      "error"
    );
    sendServerError(res);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { deleteDocuments } = req.params;
    const userId = req.user._id.toString();

    if (!userId || !deleteDocuments) return sendInvalidParameterResponse(res);

    const user = await Users.findById(userId);

    await Users.findByIdAndDelete(userId);

    if (deleteDocuments == true) {
      if (!deleteDocumentByUserName(user.name)) {
        log(
          req,
          `Error Occured While Deleting Documents of ${user.name}`,
          "controllers/users.js/deleteUser",
          "api request",
          "error"
        );

        return sendError(
          res,
          "Some error occured while deleting documents Please Delete them after Some time"
        );
      }
    }

    log(
      req,
      `${user.name} Deleted their Account`,
      "controllers/users.js/deleteUser",
      "api request",
      "info"
    );
    res.send({ success: true, message: "User Successfully Deleted" });
  } catch (error) {
    log(
      req,
      `Error Occured While Deleting User`,
      "controllers/users.js/deleteUser",
      "api request",
      "error"
    );
    sendServerError(res);
  }
};
