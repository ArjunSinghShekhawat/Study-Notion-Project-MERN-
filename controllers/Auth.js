const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const isValidEmail = require("../utils/mailSender");
const generator = require("otp-generator");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//SEND OTP CONTROLLER
exports.sendOTP = async (req, res) => {
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
    // USER ALREADY PRESENT OR EXISTS YES OR NOT
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.status(401).json({
        success: false,
        message: "User already Exists",
      });
    }
    //GENERATE UNIQUE OTP
    const otp = generator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    console.log("otp ", opt);

    const result = await OTP.find({ otp: otp });

    while (result) {
      otp = generator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.find({ otp: otp });
    }

    //STORE OTP IN DATABASE
    const otpBody = await OTP.create({ email: email, otp: otp });

    //SEND RESPONCE
    return res.status(200).json({
      success: true,
      data: otpBody,
      message: "OTP Send Successfully To User Email",
    });
  } catch (error) {
    //Error Occure While Sending OTP to the User
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong While Sending The OTP to the User",
    });
  }
};

//SIGNUP CONTROLLER
exports.signUp = async (req, res) => {
  try {
    //FETCH THE ALL REQUIRED DATA FROM REQ BODY
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

    //DATA VALIDATION
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
        message: "All fileds are Requireds",
      });
    }

    //EMAIL FORMATE VALIDATION
    if (!isValidEmail(email)) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Email Formate",
      });
    }

    //PASSWORD AND CONFIRM PASSWORD VALIDATION
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password and Confirm Password Does Not Match",
      });
    }

    //CHECK USER ALREADY EXISTS OR NOT
    const UserExists = await User.findOne({ email: email });

    if (UserExists) {
      return res.status(401).json({
        success: false,
        message: "User Already Exists",
      });
    }

    //OTP VALIDATION
    const recentOtp = await OTP.find(email).sort({ createdAt: -1 }).limit(1);

    if (!recentOtp || recentOtp.length == 0 || recentOtp === undefined) {
      return res.status(401).json({
        success: false,
        message: "Undefine OTP",
      });
    } else if (otp !== recentOtp.otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //PASSWORD HASHING
    let hashPassword;

    try {
      hashPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Password Hashing Problem",
      });
    }
    //USER PROFILE DATA CREATE
    const profileDetails = await Profile.create({
      gender: null,
      about: null,
      dateOfBirth: null,
      profession: null,
    });

    //STORE IN DATABASE
    const UserInformation = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      phoneNumber,
      accountType,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      additionalDtails: profileDetails._id,
    });

    //RETURN RESPONCE TO THE USER

    return res.status(200).json({
      success: true,
      data: UserInformation,
      message: "User Successfully SignUp",
    });
  } catch (error) {
    //Error Occure While Sending OTP to the User
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong While SignUp the User",
    });
  }
};

//LOGIN CONTROLLER
exports.login = async (req, res) => {
  try {
    //FETCH THE DATA FROM REQ BODY
    const { email, password } = req.body;

    //DATA VALIDATION
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "All fileds are Requireds",
      });
    }

    //EMAIL FORMATE VALIDATION
    if (!isValidEmail(email)) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Email Formate",
      });
    }

    //CHECK USER PRESENT OR NOT
    const user = await User.find({ email }).populate("additionalDtails").exec();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Signup required Please Firstly Signup",
      });
    }

    //PASSWORD MATCH
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      //TOKEN CREATE
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user.token = token;
      user.password = undefined;

      //COOKIE CREATE

      const options = {
        expires: Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Successfully token Created",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password Does Not Match",
      });
    }
  } catch (error) {
    //Error Occure While Sending OTP to the User
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong While login the User",
    });
  }
};

//CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    //FETCH THE DATA FROM REQ BODY
    const { oldPassword, newPassword, confirmPassword } = req.body;

    //DATA VALIDATION
    if (!oldPassword || !newPassword || !confirmPassword) {
    }
  } catch (error) {}
};
