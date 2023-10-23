const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const boardSchema = new Schema({
  title: String,
  description: String,
  drafts: [{ type: Schema.Types.ObjectId, ref: "Draft" }],
  users:[{ type: Schema.Types.ObjectId, ref: "User"}]
});

module.exports = model("Board", boardSchema);
