const mongoose = require("mongoose");
const schema = require("../schemas/pwd");

module.exports = mongoose.model("pwd", schema);