const Tag = require("../models/Tags");

//CREATE TAG CONTROLLER
exports.createTag = async (req, res) => {
  try {
    //DATA FETCH BY REQ BODY
    const { name, description } = req.body;

    //DATA VALIDATION
    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }

    //DATA STORE IN DATABASE
    const saveTgs = await Tag.create({ name: name, description: description });
    console.log(saveTgs);

    //SEND RESPONCE
    return res.status(200).json({
      success: true,
      data: saveTgs,
      message: "Tag Create Successfully",
    });
  } catch (error) {
    //ERROR OCCURE WHILE CREATING THE TAGS
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the tags",
    });
  }
};

//GET ALL TAGS
exports.getAllTags = async (req, res) => {
  try {
    //GET ALL TAGS DATA
    const allTags = await Tag.find({}, { name: true, description: true });

    //SEND RESPONCE
    return res.status(200).json({
      success: true,
      data: allTags,
      message: "Get all tags",
    });
  } catch (error) {
    //ERROR OCCURE WHILE GET ALL TAGS
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while get  the tags",
    });
  }
};
