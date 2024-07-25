const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  otp: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponce = await mailSender(
      email,
      "Verification mail from StudyNotion",
      otp
    );

    console.log("Email send Successfully :", mailResponce);
  } catch (error) {
    console.log("Error occured while sending mails", error);
    throw error;
  }
}

//pre middleware for send otp to user email before save data in database
otpSchema.post("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});
module.exports = mongoose.model("OTP", otpSchema);
