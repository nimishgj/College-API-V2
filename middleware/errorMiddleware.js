exports.notFound = (request, response, next) => {
  const error = new Error(`Resources Not Found - ${request.originalUrl}`);
  response.status(404);
  next(error);
};
