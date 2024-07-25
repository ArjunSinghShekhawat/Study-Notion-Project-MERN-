const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require("otp-generator");
const isValidEmail = require("../utils/validation");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//otp Send controller
exports.sendOTP = async (req, res) => {
  try {
    //fetch the data from req
    const { email } = req.email;

    //check email null or not
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Undefine Mail",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Email Formate",
      });
    }

    //check email exits or not
    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User Already Exits ",
      });
    }

    //otp generate
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Otp Generate", otp);

    //get always unique otp
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    //save in database
    const otpBody = await OTP.create({ email: email, otp: otp });
    console.log(otpBody);

    //send succes responce
    return res.status(200).json({
      success: true,
      data: otpBody,
      message: "OTP Send Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signup controller
exports.signUp = async (req, res) => {
  try {
    //fetch the all data from req body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phoneNumber,
      accountType,
      otp,
    } = req.body;

    //data validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phoneNumber ||
      !accountType ||
      !otp
    ) {
      return res.status(401).json({
        success: false,
        message: "All Field Are Required",
      });
    }

    //email validation
    if (!isValidEmail(email)) {
      return res.status(401).json({
        success: false,
        message: "Uncorrect Email Formate",
      });
    }
    //check password and confirm password
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message:
          "Password And Confirm Password Does Not Match ! Please try Again",
      });
    }

    //user already exists or not
    const UserExists = await User.findOne({ email });

    if (UserExists) {
      return res.status(400).json({
        success: false,
        message: "User Is Already Registor",
      });
    }

    //otp fetch most recent
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);

    //opt validation
    if (recentOtp.length == 0 || recentOtp == undefined) {
      return res.status(400).json({
        success: false,
        message: "Undefine OTP",
      });
    } else if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //password hash
    let hashPassword;

    try {
      hashPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        success: false,
        message: "Pasword Hashing Problem",
      });
    }

    //profile
    const profileDetails = await Profile.create({
      gender: null,
      about: null,
      dateOfBirth: null,
      profession: null,
    });

    //database entry
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      phoneNumber,
      accountType,
      additionalDtails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    //send responce
    return res.status(200).json({
      success: true,
      data: user,
      message: "User Successfully Registor",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User SignUp Error",
    });
  }
};

//login controller
exports.login = async (req, res) => {
  try {
    //fetch the data from req body
    const { email, password } = req.body;

    //data validation
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "All Fields are required",
      });
    }

    //email formate validation
    if (!isValidEmail(email)) {
      return res.status(401).json({
        success: false,
        message: "Uncorrect Email Formate",
      });
    }

    //check user exists or not
    const user = await User.findOne({ email })
      .populate("additionalDtails")
      .exec();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "SignUp Required!",
      });
    }

    //token create and password match
    if (await bcrypt.compare(password, existUser.password)) {
      //payload
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payload, process.env.JWT_TOKEN, {
        expiresIn: "2h",
      });

      user.token = token;
      user.password = undefined;

      //create cookies
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Login Successfully",
      });
    } else {
      //password does not match
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User Login Problem",
    });
  }
};

//change password
exports.changePassword = async (req, res) => {
  try {
    //fetch data from user
  } catch (error) {}
};
