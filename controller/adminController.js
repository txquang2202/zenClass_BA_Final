import User from "../models/user.js";
import Class from "../models/classes.js";
import Comment from "../models/comments.js";
import Grade from "../models/grades.js";
import GradeStruct from "../models/gradestructs.js";
import gradesReview from "../models/gradesReview.js";
import Homework from "../models/homeworks.js";
import env from "dotenv";
import bcrypt from "bcryptjs";
import {
  sendEmail,
  verifyEmail,
  generateUniqueToken,
} from "./authController.js";
import { constants } from "crypto";
env.config();
const deleteClassbyID = async (classID) => {
  try {
    const deletedClass = await Class.findById(classID);
    const deletedHomeWork = await Class.findOne({ _id: classID }, "homeworks");
    const deletedReview = await Class.findOne({ _id: classID }, "gradereviews");

    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found!" });
    }

    const students = deletedClass.students;
    const teachers = deletedClass.teachers;

    await User.updateMany(
      { _id: { $in: [...students, ...teachers] } },
      {
        $pull: {
          courses: classID,
          classes: classID,
        },
      }
    );

    for (const homeworkID of deletedHomeWork.homeworks) {
      const homework = await Homework.findOne({ _id: homeworkID });
      if (homework) {
        await Comment.deleteMany({ _id: { $in: homework.comments } });
      }
    }

    for (const reviewID of deletedReview.gradereviews) {
      const review = await gradesReview.findOne({ _id: reviewID });
      if (review) {
        await Comment.deleteMany({ _id: { $in: review.comments } });
      }
    }

    await GradeStruct.deleteMany({ _id: { $in: deletedClass.gradestructs } });
    await Grade.deleteMany({ _id: { $in: deletedClass.grades } });
    await gradesReview.deleteMany({ _id: { $in: deletedClass.gradereviews } });
    await Homework.deleteMany({ _id: { $in: deletedClass.homeworks } });
    await Class.findByIdAndDelete(classID);

    return { message: "Delete successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Error while deleting class" };
  }
};
const deleteStudentFromClass = async (classID, personID) => {
  try {
    const findUserID = await User.findOne({ _id: personID });

    const isStudentExists = await Class.exists({
      _id: classID,
      students: personID,
    });

    if (isStudentExists) {
      await Class.findByIdAndUpdate(
        classID,
        {
          $pull: {
            students: personID,
          },
        },
        { new: true }
      );
      await User.findOneAndUpdate(
        { courses: classID },
        {
          $pull: {
            courses: classID,
          },
        },
        { new: true }
      );
      const gradeToBeDeleted = await Class.findOne({ _id: classID }, "grades");

      if (gradeToBeDeleted.grades.length > 0) {
        for (const gradeID of gradeToBeDeleted.grades) {
          const grade = await Grade.findOne({ _id: gradeID });
          if (grade.studentId === findUserID.userID) {
            await Grade.findOneAndDelete({ _id: gradeID });
            await Class.updateOne(
              { _id: classID },
              { $pull: { grades: gradeID } }
            );
          }
        }
      }

      return { message: "Delete successfully!" };
    } else {
      res.status(404).json({ message: "Student not found in the class." });
    }
  } catch (error) {
    console.error(error);
    return { error: "Error while deleting student from class" };
  }
};
const createUserwithFile = async (req, res) => {
  try {
    const user = req.body;
    const password = "1";
    const hashedPassword = await bcrypt.hash(password, 10);
    if (user.birthdate === "Invalid date") {
      return res.status(404).json({ message: "Invalid format" });
    }

    // Generate a verification token
    const verificationToken = generateUniqueToken();
    const newUser = new User({
      userID: user.userID,
      username: user.username,
      password: hashedPassword,
      email: user.email,
      verificationToken,
      isVerified: true,
      role: 0,
      img: "",
      fullname: user.fullname || "", // You can use user.fullname if it exists, or an empty string otherwise
      birthdate: user.birthdate || "", // Similar for other optional fields
      status: user.status || "Normal",
      phone: user.phone || "",
      gender: user.gender || "",
      street: user.street || "",
      city: user.city || "",
    });

    const username = newUser.username;
    const email = newUser.email;
    const userID = newUser.userID;
    const existUsername = await User.findOne({ username });
    const existEmail = await User.findOne({ email });
    const existStudentID = await User.findOne({ userID });

    if (existUsername) {
      return res.status(400).json({ message: "Username already taken!" });
    }
    if (existEmail) {
      return res.status(400).json({ message: "Email already taken!" });
    }
    if (existStudentID) {
      return res.status(400).json({ message: "StudentID already taken!" });
    }

    await newUser.save();
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Đã xảy ra lỗi.");
  }
};
const changeInforUser = async (req, res) => {
  try {
    const user = req.body;
    const id = parseInt(user.userID);
    const userDB = await User.findOne({ userID: id });

    if (!userDB) {
      return res.status(404).json({ message: "User not found!" });
    }
    userDB.fullname = user.fullname || userDB.fullname;
    userDB.birthdate = user.birthdate || userDB.birthdate;
    userDB.phone = user.phone || userDB.phone;
    userDB.gender = user.gender || userDB.gender;
    userDB.street = user.street || userDB.street;
    userDB.city = user.city || userDB.city;

    await userDB.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while updating profile");
  }
};
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching user profile");
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: [0] });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found!" });
    }

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching users");
  }
};
const getAllUsersComments = async (req, res) => {
  try {
    const comments = await Comment.find();

    if (!comments || comments.length === 0) {
      return res.status(404).json({ message: "No comments found!" });
    }

    res.json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching users");
  }
};
const deleteUsersbyID = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching user profile");
  }
};
const deleteListUsersByIds = async (req, res) => {
  try {
    const listIdDelete = req.body;
    if (!listIdDelete || listIdDelete.length === 0) {
      return res
        .status(400)
        .json({ message: "No user IDs provided for deletion!" });
    }

    const user = await User.findById(listIdDelete);
    for (const classID of user.classes) {
      await deleteClassbyID(classID);
    }
    for (const classID of user.courses) {
      await deleteStudentFromClass(classID, user._id);
    }
    const deletedUsers = await User.deleteMany({ _id: { $in: listIdDelete } });
    if (deletedUsers.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No users found for the provided IDs!" });
    }

    res.json({ message: "Users deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while deleting users");
  }
};

const changeStatusUsers = async (req, res) => {
  try {
    const userIds = req.body;

    if (!userIds || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "No user IDs provided for blocking!" });
    }

    const result = await User.updateMany({ _id: { $in: userIds } }, [
      {
        $set: {
          status: {
            $cond: {
              if: { $eq: ["$status", "Blocked"] },
              then: "Normal",
              else: "Blocked",
            },
          },
        },
      },
    ]);

    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ message: "No users were found or updated" });
    }

    res.json({ message: "Users' status updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(`Error while updating users' status: ${error.message}`);
  }
};

const blockUserbyID = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.status === "Blocked") {
      user.status = "Normal";
    } else {
      user.status = "Blocked";
    }

    await user.save();

    res.json({ message: "User status updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while updating user status");
  }
};

const getUserbyID = async (req, res) => {
  try {
    const userIds = req.body.userIds;

    const users = await User.find({ _id: { $in: userIds } });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "Users not found!" });
    }

    res.json({ message: "Users retrieved successfully", users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while getting users");
  }
};

export {
  getUserbyID,
  createUserwithFile,
  changeInforUser,
  getUserProfile,
  getAllUsers,
  getAllUsersComments,
  sendEmail,
  verifyEmail,
  deleteUsersbyID,
  deleteListUsersByIds,
  blockUserbyID,
  changeStatusUsers,
};
