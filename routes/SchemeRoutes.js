const router = require("express").Router();

const {
  getSchemes,
  createScheme,
  deleteScheme,
  addSubject,
  deleteSubject,
} = require("../controllers/schemes");

const {
  protect,
  protectAdminRotes,
} = require("../middleware/auth/authMiddleware");

router.route("/createScheme").post(protectAdminRotes, createScheme);

router.route("/getSchemes/:role").get(protect, getSchemes);

router.route("/deleteScheme/:schemeId").get(protectAdminRotes, deleteScheme);

router.route("/addSubject").post(protectAdminRotes, addSubject);

router
  .route("/deleteSubject/:schemeId/:subjectId")
  .delete(protectAdminRotes, deleteSubject);

module.exports = router;
