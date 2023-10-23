const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const subtaskSchema = new Schema({
  title: String,
  description: String,
  task:{ type: Schema.Types.ObjectId, ref: "Task"},
  done: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("Subtask", subtaskSchema);
