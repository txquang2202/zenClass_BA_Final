import express from "express";
import env from "dotenv";
import connect from "./config/db.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import initApi from "./routes/api.js";
import session from "express-session";
import passport from "passport";
import http from "http";
import { Server as SocketIo } from "socket.io";
import "./middleware/passport.js";

const app = express();
// Environment
env.config();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));

const port = process.env.PORT;
app.use("/assets", express.static("../frontend/assets"));
// Connect to database
connect();
// API routes
app.get("/", (req, res) => {
  const welcomeHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
      </head>
      <body>
          <h1>Welcome to our ZenClass!</h1>
          <p>The Back End is running</p>
      </body>
      </html>
  `;
  res.send(welcomeHTML);
});
initApi(app);

// Connect to server
const httpServer = http.createServer(app);
const io = new SocketIo(httpServer, {
  // Các tùy chọn của Socket.IO
  cors: {
    origin: process.env.BASE_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Có người kết nối:" + socket.id);

  // Lắng nghe sự kiện "chat message" từ client
  socket.on("chat message", (message) => {
    // Phát lại sự kiện "chat message" đến tất cả các client kết nối
    io.emit("chat message", message);
  });

  // Ngắt kết nối khi client disconnects
  socket.on("disconnect", () => {
    console.log("Người dùng đã ngắt kết nối");
  });
});

// Start server
httpServer.listen(port, () => {
  console.log(`Server and Socket.IO are listening on port ${port}`);
});
