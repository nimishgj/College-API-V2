const HTTP_STATUS = {
  "OK":200,
  "INTERNAL_SERVER_ERROR":500,
  "BAD_REQUEST":400
}

exports.sendError = (res, error, status = 300) => {
  res.status(status);
  res.json({ success: false, message: error });
};

exports.sendInvalidParameterResponse = (res) => {
  res.status(HTTP_STATUS.BAD_REQUEST);
  res.json({ success: false, error: "Invalid Request,Missing Parameters" });
};

exports.sendServerError = (res) => {
  res.status(HTTP_STATUS.BAD_REQUEST);
  res.json({ success: false, error: "Internal Server Error" });
};
