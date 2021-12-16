const mongoose = require("mongoose");

module.exports = new mongoose.Schema({
  user: {type: String, trim: true, required: true},
  password: {type: String, trim: true, required: true}
});