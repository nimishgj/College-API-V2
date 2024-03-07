const router = require("express").Router();

const multer = require("multer");

const {
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument,
  getDocumentsByOwner,
  getDocumentsByScheme,
  getDocumentsBySubject,
} = require("../controllers/documents");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
  protect,
  protectAdminRotes,
} = require("../middleware/auth/authMiddleware");

router
  .route("/addDocument/:role")
  .post(protect, upload.single("file"), uploadDocument);

router.route("/getDocuments/:role").get(protect, getDocuments);

router
  .route("/documentsByOwner/:ownerId/:role")
  .get(protect, getDocumentsByOwner);

router
  .route("/documentsByScheme/:scheme/:role")
  .get(protect, getDocumentsByScheme);

router
  .route("/documentsBySubject/:subject/:role")
  .get(protect, getDocumentsBySubject);

router.route("/download/:documentName/:role").get(protect, downloadDocument);

router.route("/delete/:fileName").delete(protectAdminRotes, deleteDocument);

module.exports = router;
