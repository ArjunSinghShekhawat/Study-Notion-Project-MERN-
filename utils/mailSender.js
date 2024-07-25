const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `StudyNotion || By Arjun Singh 👻  ${process.env.MAIL_USER}`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log(info);

    return info;
  } catch (error) {
    console.log(error);
  }
};
module.exports = mailSender;
