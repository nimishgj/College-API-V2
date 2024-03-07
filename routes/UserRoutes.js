const   router = require("express").Router();

const {
  createUser,
  verifyEmail,
  login,
  changePasswordRequest,
  changePassword,
  forgotPasswordRequest,
  forgotPassword,
  deleteUser,
  logout,
} = require("../controllers/users");

const {
  protect,
  protectAdminRotes,
} = require("../middleware/auth/authMiddleware");

const {
  signUpSignInLimiter,
  resetPasswordLimiter,
  forgotPasswordLimiter,
} = require("../middleware/limiter/limiter");

router.route("/createUser").post(signUpSignInLimiter, createUser);

router.route("/verifyUser").post(protect, verifyEmail);

router.route("/login").post(signUpSignInLimiter, login);

router.route("/logout").post(logout);

router
  .route("/changePasswordRequest/:role")
  .post(resetPasswordLimiter, protect, changePasswordRequest);

router
  .route("/changePassword/:role")
  .post(resetPasswordLimiter, protect, changePassword);

router
  .route("/forgotPasswordRequest")
  .post(forgotPasswordLimiter, forgotPasswordRequest);

router.route("/forgotPassword").post(forgotPasswordLimiter, forgotPassword);

router
  .route("/deleteUser/:deleteDocuments")
  .delete(protectAdminRotes, deleteUser);

module.exports = router;
