import User from "../models/user.js";
import Comment from "../models/comments.js";
import env from "dotenv";
import bcrypt from "bcryptjs";
import {
  sendEmail,
  verifyEmail,
  generateUniqueToken,
} from "./authController.js";
env.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const lastUser = await User.findOne({}, {}, { sort: { userID: -1 } });
    const newUserID = lastUser ? Number(lastUser.userID) + 1 : 20127001;

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateUniqueToken();

    const newUser = new User({
      username,
      userID: newUserID,
      password: hashedPassword,
      email,
      verificationToken,
      isVerified: false,
      role: 0,
      img: "",
      fullname: "",
      birthdate: "",
      phone: "",
      gender: "",
      street: "",
      city: "",
      status: "Normal",
      courses: [],
      classes: [],
    });

    const existUsername = await User.findOne({ username });
    const existEmail = await User.findOne({ email });

    if (existUsername) {
      return res.status(400).json({ message: "Username already taken!" });
    }
    if (existEmail) {
      return res.status(400).json({ message: "Email already taken!" });
    }

    // Bước 3: Lưu trữ người dùng mới vào cơ sở dữ liệu
    await newUser.save();

    await sendEmail(email, verificationToken);

    res.json({
      message: "Register successfully, check your email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred: " + error.message);
  }
};

const createUserOauth = async (username, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const lastUser = await User.findOne({}, {}, { sort: { userID: -1 } });

    const newUserID = lastUser ? lastUser.userID + 1 : 20127001;
    const newUser = new User({
      username,
      userID: newUserID,
      password: hashedPassword,
      email,
      isVerified: true,
      role: 0,
      img: "",
      fullname: "",
      birthdate: "",
      phone: "",
      gender: "",
      street: "",
      city: "",
      status: "Normal",
      courses: [],
      classes: [],
    });

    await newUser.save();

    return newUser;
  } catch (error) {
    console.error(error);
    throw new Error("Error: " + error.message);
  }
};

const editUser = async (req, res) => {
  try {
    const { fullname, birthdate, phone, gender, street, city } = req.body;
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Update user properties
    user.fullname = fullname || user.fullname;
    user.birthdate = birthdate || user.birthdate;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;
    user.street = street || user.street;
    user.city = city || user.city;

    // Check if there is a file in the request
    if (req.file) {
      const localImagePath = req.file.path;

      // Upload image to Cloudinary
      cloudinary.uploader.upload(localImagePath, async (error, result) => {
        if (error) {
          console.error("Error uploading image to Cloudinary:", error);
          return res
            .status(500)
            .json({ message: "Error while updating profile" });
        }

        // Save the secure URL of the image to user.img
        user.img = result.secure_url;

        // Save user information to the database
        await user.save();
        res.json({ message: "Profile updated successfully", user });
      });
    } else {
      // If no file is uploaded, save user information to the database
      await user.save();
      res.json({ message: "Profile updated successfully", user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while updating profile" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(405).json({ message: "User not found!" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching user profile");
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found!" });
    }

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching users");
  }
};
export {
  createUser,
  editUser,
  getUserProfile,
  getAllUsers,
  sendEmail,
  verifyEmail,
  createUserOauth,
};
