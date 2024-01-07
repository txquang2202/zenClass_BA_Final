import mongoose from "mongoose";
const { Schema } = mongoose;

const homeworksSchema = new mongoose.Schema({
  title: String,
  description: String,
  teacher: String,
  date: Date,
  comments: [{ type: Schema.Types.ObjectId, ref: "comments" }],
});

const Homework = mongoose.model("homeworks", homeworksSchema);

export default Homework;
