const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const draftSchema = new Schema({
  title: String,
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  board: { type: Schema.Types.ObjectId, ref: "Board" }
});

module.exports = model("Draft", draftSchema);
