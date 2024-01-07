import Comment from "../models/comments.js";
import Class from "../models/classes.js";
import User from "../models/user.js";
import Homework from "../models/homeworks.js";

const addComment = async (req, res) => {
  try {
    const homeworkID = req.params.id;
    const { userID, content, avt, date } = req.body;
    // console.log(req.body);
    const user = await User.findOne({ userID: userID });
    const newComment = new Comment({
      username: user.fullname,
      content,
      avt,
      date,
    });

    await newComment.save();
    const homeworkCMT = await Homework.findById(homeworkID);

    if (!homeworkCMT.comments.includes(newComment._id)) {
      homeworkCMT.comments.push(newComment._id);
      await homeworkCMT.save();
    }
    res.json({ message: "Adding succesfully!", comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getAllUsersComments = async (req, res) => {
  try {
    const homeworkID = req.params.id;
    const comments = await Homework.findOne(
      { _id: homeworkID },
      "comments"
    ).populate({
      path: "comments",
      select: "username content avt date",
    });
    //console.log(comments.comments);

    res.json({ comments: comments.comments });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching users");
  }
};
const deleteComment = async (req, res) => {
  try {
    const commentID = req.params.id;

    const classWithComment = await Homework.findOne({ comments: commentID });

    if (!classWithComment) {
      return res.status(404).json({ message: "Comments not found!" });
    }
    classWithComment.comments = classWithComment.comments.filter(
      (id) => id.toString() !== commentID
    );

    await classWithComment.save();

    await Comment.findByIdAndDelete(commentID);

    res.json({ message: "Delete successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while deleting homework");
  }
};
export { addComment, getAllUsersComments, deleteComment };
