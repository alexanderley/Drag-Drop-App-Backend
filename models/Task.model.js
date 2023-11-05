const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const taskSchema = new Schema({
  title: String,
  subtasks:[{ type: Schema.Types.ObjectId, ref: "Subtask"}]
});

module.exports = model("Task", taskSchema);
