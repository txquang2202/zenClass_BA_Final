import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationsSchema = new mongoose.Schema({
  fullname: String,
  content: String,
  avt: String,
  date: Date,
  link: String,
});

const Notification = mongoose.model("notifications", notificationsSchema);

export default Notification;
