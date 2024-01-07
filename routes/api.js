import {
  createUser,
  editUser,
  getUserProfile,
} from "../controller/userController.js";
import {
  handleLogin,
  verifyEmail,
  updatePassword,
  verifyReset,
  resetPassword,
  initGG,
  authenticateGG,
  handleAuthenticationGG,
  initFB,
  authenticateFB,
  handleAuthenticationFB,
} from "../controller/authController.js";
import {
  getAllClasses,
  createClass,
  deleteClassbyID,
  editClass,
  getClassByID,
  addStudent,
  addTeacher,
  getClassMembers,
  invitationLink,
  deleteStudentFromClass,
  deleteTeacherFromClass,
  joinByCode,
  getAllClass,
  changeStatusClass,
  deleteListclasssByIds,
  getclassbyurl,
  checkInClass,
} from "../controller/classController.js";
import {
  getCourseByUser,
  getCourseByID,
} from "../controller/coursesController.js";
import express from "express";
import { authenticateToken } from "../middleware/jwt.js";
import upload from "../middleware/multer.js";
import {
  deleteUsersbyID,
  deleteListUsersByIds,
  blockUserbyID,
  getAllUsers,
  changeStatusUsers,
  changeInforUser,
  createUserwithFile,
  getUserbyID,
} from "../controller/adminController.js";
import {
  addComment,
  getAllUsersComments,
  deleteComment,
} from "../controller/commentsController.js";
import {
  deleteHomeworkByID,
  editHomeworkByID,
  createHomeworkByID,
  getAllHomework,
  getHomeworkByID,
} from "../controller/homeworkController.js";
import {
  deleteGradeStruct,
  editGradeStruct,
  addGradeStruct,
  getAllGradeStructs,
  getAllGradeByClass,
  editClassGrade,
  addGradeToClass,
  deleteAllGrade,
  editStatusGrade,
} from "../controller/gradeController.js";

import {
  getAllGradeReviews,
  addGradeReviewByID,
  deleteReviewByID,
} from "../controller/gradeReviewController.js";

import {
  getAllUsersReplies,
  addReply,
  deleteReply,
} from "../controller/cmtReviewController.js";

import {
  getAllNotifications,
  addNotification,
  addNotificationTeacher,
  deleteNotiByID,
  deleteAllNoti,
} from "../controller/notificationController.js";

import "../middleware/passport.js";

const router = express.Router();
// @param {*} app: express app
// middleware.js

const initApi = (app) => {
  //goolge login
  router.get("/auth/google", initGG);
  router.get("/auth/google/callback", authenticateGG, handleAuthenticationGG);
  //facebook login
  router.get("/auth/facebook", initFB);
  router.get("/auth/facebook/callback", authenticateFB, handleAuthenticationFB);
  //unprotect
  router.post("/register", createUser);
  router.post("/login", handleLogin);
  router.get("/verifyReset", verifyReset);
  router.get("/verify", verifyEmail);
  router.post("/deleteUser/:id", deleteUsersbyID);
  router.post("/deleteListUser", deleteListUsersByIds);
  router.post("/changeStatusListUser", changeStatusUsers);
  router.post("/blockUserbyID/:id", blockUserbyID);
  router.post("/getuserbyid", getUserbyID);

  router.post("/updatePassword/:id", updatePassword);
  router.post("/resetPassword", resetPassword);

  //protected api
  router.get("/getallusers", authenticateToken, getAllUsers);
  router.get("/getprofile/:id", authenticateToken, getUserProfile);
  router.put("/editprofile/:id", authenticateToken, upload, editUser);
  router.post("/changeinforuser", changeInforUser);
  router.post("/registerwithfile", createUserwithFile);
  //class APIs
  router.get("/getAllclass", getAllClass);
  router.get("/getClassID/:id", authenticateToken, getClassByID);
  router.post("/createClass", authenticateToken, createClass);
  router.delete("/deleteClass/:id", authenticateToken, deleteClassbyID);
  router.put("/editclass/:id", authenticateToken, editClass);
  router.get("/addStudentsToClass/:id", addStudent);
  router.get("/addTeacherToClass/:id", addTeacher);
  router.get("/getclassmembers/:id", authenticateToken, getClassMembers);
  router.post("/sendInvitation/:id", authenticateToken, invitationLink);
  router.post(
    "/deleteStudentFromClass/:id",
    authenticateToken,
    deleteStudentFromClass
  );
  router.post(
    "/deleteTeacherFromClass/:id",
    authenticateToken,
    deleteTeacherFromClass
  );
  router.get("/getallclasses/:id", authenticateToken, getAllClasses);
  router.post("/joinbycode/:id", authenticateToken, joinByCode);
  router.get("/getAllclass", getAllClass);
  router.post("/changeStatusListClass", changeStatusClass);
  router.post("/deleteListclass", deleteListclasssByIds);
  router.post("/getclass", getclassbyurl);
  router.post("/checkInClass/:id", checkInClass);
  //coureseAPIS
  router.get("/getCourseByUser/:id", authenticateToken, getCourseByUser);
  router.get("/getCourseByID/:id", authenticateToken, getCourseByID);
  //HomeworkAPIS
  router.get("/getAllHomework/:id", authenticateToken, getAllHomework);
  router.get("/getHomeworkByID/:id", authenticateToken, getHomeworkByID);
  router.post("/createHomework/:id", authenticateToken, createHomeworkByID);
  router.put("/editHomework/:id", authenticateToken, editHomeworkByID);
  router.delete("/deleteHomework/:id", authenticateToken, deleteHomeworkByID);
  // router.post("/createClass", authenticateToken, createHomeworkByID);
  // router.put("/editclass/:id", authenticateToken, editHomeworkByID);
  // router.delete("/deleteClass/:id", authenticateToken, deleteHomeworkByID);
  //CommentAPIS
  router.get("/getComments/:id", authenticateToken, getAllUsersComments);
  router.post("/addComments/:id", authenticateToken, addComment);
  router.delete("/deleteComment/:id", authenticateToken, deleteComment);

  //GradeStructs
  router.get("/getAllGradeStructs/:id", authenticateToken, getAllGradeStructs);
  router.post("/addGradeStruct/:id", authenticateToken, addGradeStruct);
  router.put("/editGradeStruct/:id", authenticateToken, editGradeStruct);
  router.delete("/deleteGradeStruct/:id", authenticateToken, deleteGradeStruct);

  //Grade
  router.get("/getAllGradeClass/:id", authenticateToken, getAllGradeByClass);
  router.put("/editClassGrade/:id", authenticateToken, editClassGrade);
  router.put("/editStatusGrade/:id", editStatusGrade);
  router.post("/addGradeToClass/:id", authenticateToken, addGradeToClass);
  router.delete("/deleteAllGrade/:id", deleteAllGrade);
  // router.post("/addComments", authenticateToken, addComment);

  // GradeReviews
  router.get("/getAllGradeReviews/:id", authenticateToken, getAllGradeReviews);
  router.post("/addGradeReview/:id", authenticateToken, addGradeReviewByID);
  router.post("/deleteReviewByID/:id", authenticateToken, deleteReviewByID);
  router.get("/getAllUsersReplies/:id", authenticateToken, getAllUsersReplies);
  router.post("/addReply/:id", authenticateToken, addReply);
  router.delete("/deleteReply/:id", authenticateToken, deleteReply);

  // Notifications
  router.get("/getAllNotifications/:id", getAllNotifications);
  router.post("/addNotification/:id", addNotification);
  router.post("/addNotificationTeacher/:id", addNotificationTeacher);
  router.delete("/deleteNotiByID/:id", deleteNotiByID);
  router.delete("/deleteAllNoti/:id", deleteAllNoti);

  return app.use("/api/v1/", router);
};

export default initApi;
