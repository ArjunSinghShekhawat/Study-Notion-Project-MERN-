const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const uploadImageToCloudinary = require("../utils/ImageUpload");

//CREATE COURSE CONTROLLER
exports.createCourse = async (req, res) => {
  try {
    //DATA FETCH BY REQ BODY
    const { courseName, courseDescription, whatWillYouLearn, price, tag } =
      req.body;

    //COURSE THUMBNAIL
    const thumbnail = req.files.imageThumbnail;

    //DATA VALIDATION
    if (
      !courseName ||
      !courseDescription ||
      !whatWillYouLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }

    //CHECK INSTRUCTOR LEVEL VALIDATION
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);

    console.log(instructorDetails);

    if (!instructorDetails) {
      return res.status(401).json({
        success: false,
        message: "Instructor Details Not Found",
      });
    }

    //CHECK TAGS LEVEL VALIDATION
    const tagDetails = await Tag.findById(tag);

    if (!tagDetails) {
      return res.status(401).json({
        success: false,
        message: "Tags Details Not Found",
      });
    }

    //UPLOAD IMAGE TO CLUDINARY
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER
    );

    //CREATE NEW COURSE
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatWillYouLearn: whatWillYouLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    //UPDATE INSTRUCTOR IN  USER SCHEMA
    await User.findByIdAndUpdate(
      { _id: instructor._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    //TAG SCHEMA UPDATE
    await Tag.findByIdAndUpdate(
      { _id: tag },
      { $push: { course: newCourse._id } },
      { new: true }
    );

    //RESPONCE
    return res.status(200).json({
      success: false,
      data: newCourse,
      message: "Course Created Successfully",
    });
  } catch (error) {
    //Error Occure While Sending OTP to the User
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong While Creating a new Course",
      error: error.message,
    });
  }
};
//SHOW ALL COURSE
exports.showAllCourse = async (req, res) => {
  try {
    //FETCH ALL COURSE FROM DATABASE
    const allCourse = await Course.find(
      {},
      {
        courseName: true,
        courseDescription: true,
        whatWillYouLearn: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReview: true,
        studentEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    //SEND RESPONCE
    return res.status(200).json({
      success: true,
      data: allCourse,
      message: "Show all course successfully",
    });
  } catch (error) {
    //Error Occure While Sending OTP to the User
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong While show all course",
      error: error.message,
    });
  }
};
