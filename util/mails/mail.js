const nodemailer = require("nodemailer");

exports.generateOtp = () => {
  let otp = "";
  for (let i = 0; i < 4; i++) {
    otp += Math.round(Math.random() * 9);
  }
  return otp;
};

exports.mailTransport = () =>
  nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
