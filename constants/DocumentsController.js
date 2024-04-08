exports.CONTROLLER = {
    GET_DOCS_BY_OWNER: "controllers/documents.js/getDocumentsByOwner",
    GET_DOCS_BY_SCHEME: "controllers/documents.js/getDocumentsByScheme",
    GET_DOCS_BY_SUBJECT: "controllers/documents.js/getDocumentsBySubject",
    GET_ALL_DOCS: "controllers/documents.js/getDocuments",
    UPLOAD_DOCUMENT: "controllers/documents.js/uploadDocument",
    DOWNLOAD_DOCUMENT: "controllers/documents.js/downloadDocument",
    DELETE_DOCUMENT: "controllers/documents.js/deleteDocument",
    DELETE_DOCS_BY_USERNAME: "controllers/documents.js/deleteDocumentByUserName",
  };


exports.RESPONSE_MESSAGE = {
    FETCH_ERROR: `Error Occured While Fetching All the Documents`,
    INVALID_SCHEME_SUBJECT: "Invalid Scheme or Subject Provided",
    SAME_FILE_NAME: "File with the Same Name Exists",
    DOCUMENT_UPLOADED:"Document Uploaded Successfully",
    DOCUMENT_UPLOAD_ERROR: `Error Occured While Uploading Document`,
    FILE_DELETION_SUCCESS: "File Deleted Successfully"
}