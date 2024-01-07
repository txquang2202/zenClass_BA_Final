import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  // date: Date,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
