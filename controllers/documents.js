const { log } = require("../middleware/logger/logger");
const {
  sendError,
  sendInvalidParameterResponse,
  sendServerError,
} = require("../util/Responses");
const documents = require("../models/Document.model");
const Users = require("../models/User.model");

const {
  deleteFile,
  getObjectSignedUrl,
  uploadFile,
} = require("../util/aws/s3");
const { checkScheme } = require("./schemes");

const LOG_LEVEL = {
  INFO: "INFO",
  ERROR: "ERROR",
};

const HTTP_STATUS = {
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
};

const LOG_TYPE = {
  REQUEST: "API REQ",
  ERROR_GENERATION: "ERR GEN",
};

const CONTROLLER = {
  GET_DOCS_BY_OWNER: "controllers/documents.js/getDocumentsByOwner",
  GET_DOCS_BY_SCHEME: "controllers/documents.js/getDocumentsByScheme",
  GET_DOCS_BY_SUBJECT: "controllers/documents.js/getDocumentsBySubject",
  GET_ALL_DOCS: "controllers/documents.js/getDocuments",
  UPLOAD_DOCUMENT: "controllers/documents.js/uploadDocument",
  DOWNLOAD_DOCUMENT: "controllers/documents.js/downloadDocument",
  DELETE_DOCUMENT: "controllers/documents.js/deleteDocument",
  DELETE_DOCS_BY_USERNAME: "controllers/documents.js/deleteDocumentByUserName",
};
const generateFileName = (bytes = 32) => {
  const randomString = Math.random().toString(36).substring(2, bytes + 2);
  return randomString;
};
exports.getDocumentsByOwner = async (request, response) => {
  let userId;
  let documentOwnerId;
  try {
    if (
      !(documentOwnerId = request.params.ownerId) ||
      !(userId = request.user._id.toString())
    )
      return sendInvalidParameterResponse(response);

    const user = await Users.findById(request.user._id);

    // TODO unhash the sorting in production

    let documents = await documents
      .find({ owner: user.name })
      .sort({ created: -1 })
      .exec();

    documents = documents || [];

    await log(
      request,
      `${user.name} Fetched All the Documents By OwnerId ${documentOwnerId}`,
      CONTROLLER.GET_DOCS_BY_OWNER,
      LOG_TYPE.REQUEST,
      LOG_LEVEL.INFO
    );

    response.status(HTTP_STATUS.OK);
    response.json({ success: true, documents });
  } catch (error) {
    log(
      request,
      `Error Occured While Fetching All the Documents from user ${userId}`,
      CONTROLLER.GET_DOCS_BY_OWNER,
      LOG_TYPE.ERROR_GENERATION,
      LOG_LEVEL.ERROR
    );
    sendServerError(response);
  }
};

exports.getDocumentsByScheme = async (request, response) => {
  try {
    const { scheme } = request.params;
    const userId = request.user._id.toString();

    if (!userId || !scheme) return sendInvalidParameterResponse(response);

    const user = await Users.findById(userId);

    let documents = await documents
      .find({ scheme })
      .sort({ created: -1 })
      .exec();

    if (!documents) return sendError(response, "Invalid Scheme Selected");

    await log(
      request,
      `${user.name} Fetched All the Documents By Scheme ${scheme}`,
      CONTROLLER.GET_DOCS_BY_SCHEME,
      LOG_TYPE.REQUEST,
      LOG_LEVEL.INFO
    );

    response.status(HTTP_STATUS.OK).json({ success: true, documents });
  } catch (error) {
    log(
      request,
      `Error Occured While Fetching All the Documents By Scheme ${scheme}`,
      CONTROLLER.GET_DOCS_BY_SCHEME,
      LOG_TYPE.ERROR_GENERATION,
      LOG_LEVEL.ERROR
    );
    sendServerError(response);
  }
};

exports.getDocumentsBySubject = async (request, response) => {
  try {
    const { subject } = request.params;
    const userId = request.user._id.toString();

    if (!userId || !subject) return sendInvalidParameterResponse(response);

    const user = await Users.findById(userId);

    let documents = await documents.find({ subject }); //.sort({ created: -1 }).exec();

    if (!documents) return sendError(response, "Invalid Subject Selected");

    await log(
      request,
      `${user.name} Fetched All the Documents By Subject ${subject}`,
      CONTROLLER.GET_DOCS_BY_SUBJECT,
      LOG_TYPE.REQUEST,
      LOG_LEVEL.INFO
    );

    response.status(HTTP_STATUS.OK);
    response.json({ success: true, documents });
  } catch (error) {
    log(
      request,
      `Error Occured While Fetching All the Documents By Subject ${subject}`,
      CONTROLLER.GET_DOCS_BY_SUBJECT,
      LOG_TYPE.ERROR_GENERATION,
      LOG_LEVEL.ERROR
    );
    sendServerError(response);
  }
};

exports.getDocuments = async (request, response) => {
  try {
    const userId = request.user._id.toString();

    const user = await Users.findById(userId);

    let documents = await documents.find().sort({ created: -1 }).exec();

    if (!documents) return sendError(response, "No Documents found");

    await log(
      request,
      `${user.name} Fetched All the Documents`,
      CONTROLLER.GET_ALL_DOCS,
      LOG_TYPE.REQUEST,
      LOG_LEVEL.INFO
    );
    response.status(HTTP_STATUS.OK).json({ success: true, documents });
  } catch (error) {
    console.log(error);
    log(
      request,
      `Error Occured While Fetching All the Documents`,
      CONTROLLER.GET_ALL_DOCS,
      LOG_TYPE.ERROR_GENERATION,
      LOG_LEVEL.ERROR
    );
    sendServerError(response);
  }
};

exports.uploadDocument = async (request, response) => {
  const file = request.file;
  const fileName = generateFileName();
  const fileBuffer = file.buffer;
  const name = request.body.name;
  const scheme = request.body.scheme;
  const subject = request.body.subject;
  const userId = request.user._id.toString();
  try {
    if (!name || !subject || !scheme || !userId)
      return sendInvalidParameterResponse(response);

    const user = await Users.findById(userId);

    const isSchemeValid = await checkScheme(scheme, subject);

    if (!isSchemeValid) {
      return sendError(response, "Invalid Scheme or Subject Provided");
    }

    const existingDocument = await documents.findOne({ name: name });
    if (existingDocument) {
      return sendError(response, "File with the Same Name Exists");
    }

    const document = new documents({
      name,
      filename: fileName,
      owner: user.name,
      subject,
      scheme,
    });

    await uploadFile(fileBuffer, fileName, file.mimetype);

    await document.save();

    log(
      request,
      `${user.name} Uploaded Document ${document.name} `,
      CONTROLLER.UPLOAD_DOCUMENT,
      LOG_TYPE.REQUEST,
      LOG_LEVEL.INFO
    );

    response
      .status(HTTP_STATUS.OK)
      .json({ success: true, message: "Document Uploaded Successfully" });
  } catch (error) {
    console.log(error);
    log(
      request,
      `Error Occured While Uploading Document`,
      CONTROLLER.UPLOAD_DOCUMENT,
      LOG_TYPE.ERROR_GENERATION,
      LOG_LEVEL.ERROR
    );
    sendServerError(response);
  }
};

exports.downloadDocument = async (request, response) => {
  const { documentName } = request.params;
  const userId = request.user._id.toString();

  try {
    if (!documentName || !userId) return sendInvalidParameterResponse(response);

    const user = await Users.findById(userId);

    log(
      request,
      `${user.name} Downloaded Document ${documentName} `,
      CONTROLLER.DOWNLOAD_DOCUMENT,
      LOG_TYPE.REQUEST,
      LOG_LEVEL.INFO
    );

    const downloadUrl = await getObjectSignedUrl(documentName);
    response.header(
      "Content-Disposition",
      'attachment; filename="downloaded.csv"'
    ); // Set the download filename
    response.redirect(downloadUrl); // Redirect to the signed URL for download
  } catch (error) {
    log(
      request,
      `Error Occured While Downloading Document ${documentName}`,
      CONTROLLER.DOWNLOAD_DOCUMENT,
      LOG_TYPE.ERROR_GENERATION,
      LOG_LEVEL.ERROR
    );
    sendServerError(response);
  }
};

exports.deleteDocument = async (request, response) => {
  try {
    const { fileName } = request.params;
    const userId = request.user._id.toString();
    if (!userId || !fileName) return sendInvalidParameterResponse(response);

    const user = await Users.findById(userId);

    await deleteFile(fileName);
    await documents.findOneAndDelete({ filename: fileName });

    log(
      request,
      `${user.name} Deleted Document ${fileName} `,
      CONTROLLER.DELETE_DOCUMENT,
      LOG_TYPE.REQUEST,
      LOG_LEVEL.INFO
    );
    response
      .status(HTTP_STATUS.OK)
      .json({ success: true, message: "File Deleted Successfully" });
  } catch (error) {
    log(
      request,
      `Error Occured While Deleting Document ${fileName}`,
      CONTROLLER.DELETE_DOCUMENT,
      LOG_TYPE.ERROR_GENERATION,
      LOG_LEVEL.ERROR
    );
    sendServerError(response);
  }
};

exports.deleteDocumentByUserName = async (userName) => {
  try {
    await documents.deleteMany({ owner: userName });
    log(
      request,
      `Deleted All Documents of User ${userName}`,
      CONTROLLER.DELETE_DOCS_BY_USERNAME,
      "API REQ",
      LOG_LEVEL.INFO
    );
    return true;
  } catch (error) {
    log(
      request,
      `Error Occured While Deleting All Documents of User ${userName}`,
      CONTROLLER.DELETE_DOCS_BY_USERNAME,
      LOG_TYPE.ERROR_GENERATION,
      LOG_LEVEL.ERROR
    );
    return false;
  }
};
