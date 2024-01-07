import mongoose from "mongoose";
const { Schema } = mongoose;

const commentsSchema = new mongoose.Schema({
  username: String,
  content: String,
  avt: String,
  date: Date,
});

const Comment = mongoose.model("comments", commentsSchema);

export default Comment;
