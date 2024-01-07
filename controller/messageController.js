import Message from "../models/Message";

const saveMessage = async (req, res) => {
  const { text } = req.body;

  try {
    // Lưu tin nhắn vào MongoDB
    const newMessage = new Message({ content });
    await newMessage.save();

    // Phát lại tin nhắn đến tất cả các client
    io.emit("chat message", content);

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error saving message to MongoDB:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { saveMessage };
