exports.notFound = (req, res, next) => {
  const error = new Error(`Resources Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
