import mongoose from "mongoose";
const { Schema } = mongoose;

const gradeStructSchema = new mongoose.Schema({
  topic: { type: String, default: "New Grade" },
  ratio: { type: Number, default: 0 },
});

const GradeStruct = mongoose.model("gradestructs", gradeStructSchema);

export default GradeStruct;
