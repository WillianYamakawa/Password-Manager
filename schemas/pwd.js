const mongoose = require("mongoose");

module.exports = new mongoose.Schema({
  owner: {type: String, trim: true, required: true},
  name: {type: String, trim: true, required: true},
  login: {type: String, trim: true, default: "-"},
  password: {type: String, trim: true, required: true},
  comment: {type: String, trim: true, default: "-"}
});
