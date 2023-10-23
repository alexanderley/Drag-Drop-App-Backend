const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const draftSchema = new Schema({
  title: String,
  description: String,
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  users:[{ type: Schema.Types.ObjectId, ref: "User"}]
});

module.exports = model("Draft", draftSchema);
