const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const isValidEmail = require("../utils/validation");
const bycrpt = require("bcrypt");

//RESET PASSWORD TOKEN
exports.resetPasswordToken = async (req, res) => {
  try {
    //FETCH DATA FROM REQ BODY
    const { email } = req.body;

    //DATA VALIDATION
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Undefine Email",
      });
    }

    //EMAIL FORMATE VALIDATION
    if (!isValidEmail(email)) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Email formate",
      });
    }

    //CHECK USER PRESENT OR NOT
    const userExists = await User.findOne({ email: email });

    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: "User not exists please signUp before",
      });
    }

    //CREATE TOKEN
    const token = crypto.randomUUID();

    //UPDATED USER DETAILS
    const updatedUserDetails = await User.findOneAndUpdate(
      { email: email },
      { token: token, resetPasswordExpire: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );

    //FRONT-END LINK
    const url = `http://localhost:3000/update-password/${token}`;

    //SEND EMAIL
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link ${url}`
    );

    //SEND RESPONCE
    return res.status(200).json({
      success: true,
      message: "Email send successfully please check email",
    });
  } catch (error) {
    //ERROR OCCURE WHILE SENDING THE FRONT-END URL TO THE USER
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sent email",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    //FETCH DATA FROM REQ BODY
    const { password, confirmPassword, token } = req.body;

    //DATA VALIDATION
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password and Confirm Password Does Not Match",
      });
    }

    //CHECK USER EXISTS OR NOT
    const userDetails = await User.findOne({ token: token });

    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "User Not Exists",
      });
    }

    //CHECK TOKEN VALIDATION TIME
    if (userDetails.resetPasswordToken > Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token Expire Please Re-Generete Token",
      });
    }

    //PASSWORD HASHING
    let hashPassword;
    try {
      hashPassword = await bycrpt.hash(password, 10);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Password Hashing Problem",
      });
    }

    //UPDATED USER DETAILS
    const updatedUser = await User.findOneAndUpdate(
      { token: token },
      { password: hashPassword },
      { new: true }
    );

    //SEND RESPONCE
    return res.status(200).json({
      success: true,
      data: UserInformation,
      message: "Password Successfully Reset",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sent reset password",
    });
  }
};
