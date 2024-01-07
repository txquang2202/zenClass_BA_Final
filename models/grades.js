import mongoose from "mongoose";
const { Schema } = mongoose;

const GradeSchema = new mongoose.Schema({
  studentId: Number,
  fullName: String,
  grades: [
    {
      topic: String,
      ratio: Number,
      score: { type: Number, default: 0 },
    },
  ],
  status: { type: Boolean, default: false },
});

const Grade = mongoose.model("grades", GradeSchema);

export default Grade;
