const mongoose = require("mongoose");
require("dotenv").config();

const databaseConnect = (req, res) => {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
      console.log("Database connect successfully.");
    })
    .catch((error) => {
      console.error(error);
      console.log("Database not connect", error);
      process.exit(1);
    });
};
module.exports = databaseConnect;
