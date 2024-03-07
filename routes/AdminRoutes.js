const router = require("express").Router();

const { sendLogFile, getRecentLogs } = require("../controllers/logs");

const { protectAdminRotes } = require("../middleware/auth/authMiddleware");

router.route("/downloadLogs").get(protectAdminRotes, sendLogFile);

router.route("/getRecentLogs").get(protectAdminRotes, getRecentLogs);

module.exports = router;
