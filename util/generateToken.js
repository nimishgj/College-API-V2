const jwt = require("jsonwebtoken");

exports.generateToken = (response, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });

  response.cookie("jwt", token, {
    path: "/",
    httpOnly: false,
    priority: "high",
    maxAge: 5 * 24 * 60 * 60 * 1000,
    sameSite: "None", // Set SameSite to 'None' for cross-origin requests
    secure: true, // Set to true for secure (HTTPS) environments
  });
};
