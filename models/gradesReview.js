import mongoose from "mongoose";
const { Schema } = mongoose;

const gradesReviewSchema = new mongoose.Schema({
  avt: String,
  // username: String,
  fullname: String,
  userID: Number,
  date: Date,
  typeGrade: String,
  currentGrade: Number,
  expectationGrade: Number,
  explaination: String,
  comments: [{ type: Schema.Types.ObjectId, ref: "comments" }],
});

const gradesReview = mongoose.model("gradereviews", gradesReviewSchema);

export default gradesReview;
