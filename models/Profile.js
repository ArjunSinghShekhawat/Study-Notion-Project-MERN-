const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
    trim: true,
  },
  about: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: String,
  },
  profession: {
    type: String,
  },
});
module.exports = mongoose.model("Profile", profileSchema);
