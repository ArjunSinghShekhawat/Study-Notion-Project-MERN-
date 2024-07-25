const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    require: true,
    trim: true,
  },
  courseDescription: {
    type: String,
    require: true,
    trim: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  whatWillYouLearn: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReview: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
      require: true,
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tag",
  },
  studentEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
  ],
});
module.exports = mongoose.model("Course", courseSchema);
