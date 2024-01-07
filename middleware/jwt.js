import jwt, { decode } from "jsonwebtoken";
import env, { decrypt } from "dotenv";
import express from "express";

env.config();

const app = express();

const createToken = (user) => {
  const { _id, username, role, isVerified, status, fullname, userID } = user;
  const secretKey = process.env.SECRET_KEY;

  try {
    const token = jwt.sign(
      {
        _id,
        username,
        role,
        isVerified,
        status,
        fullname,
        userID,
      },
      secretKey,
      {
        expiresIn: "3h",
        algorithm: "HS256",
      }
    );
    return token;
  } catch (error) {
    console.error("Error creating token:", error);
    return null;
  }
};
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.error("Error verifying token:", err);
      return res.status(600).json("You are not authorized to access this!!");
    }

    req.user = user;
    next();
  });
};

export { createToken, authenticateToken };
