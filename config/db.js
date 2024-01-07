import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURL =
  process.env.DATABASE_URL ||
  "mongodb+srv://quang234:quang234@cluster0.im4tmby.mongodb.net";

async function connect() {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
}

export default connect;
