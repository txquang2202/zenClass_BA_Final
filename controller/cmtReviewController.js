import Class from "../models/classes.js";
import Comment from "../models/comments.js";
import gradesReview from "../models/gradesReview.js";

const addReply = async (req, res) => {
  try {
    const reviewID = req.params.id;
    const { username, content, avt, date } = req.body;

    const newComment = new Comment({
      username,
      content,
      avt,
      date,
    });

    await newComment.save();
    const reviewCMT = await gradesReview.findById(reviewID);

    if (!reviewCMT.comments.includes(newComment._id)) {
      reviewCMT.comments.push(newComment._id);
      await reviewCMT.save();
    }
    res.json({ message: "Adding succesfully!", comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getAllUsersReplies = async (req, res) => {
  try {
    const reviewID = req.params.id;
    const comments = await gradesReview
      .findOne({ _id: reviewID }, "comments")
      .populate({
        path: "comments",
        select: "username content avt date",
      });

    res.json({ comments: comments.comments });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching users");
  }
};

const deleteReply = async (req, res) => {
  try {
    const commentID = req.params.id;

    const reviewWithComment = await gradesReview.findOne({
      comments: commentID,
    });

    if (!reviewWithComment) {
      return res.status(404).json({ message: "Comments not found!" });
    }
    reviewWithComment.comments = reviewWithComment.comments.filter(
      (id) => id.toString() !== commentID
    );

    await reviewWithComment.save();

    await Comment.findByIdAndDelete(commentID);

    res.json({ message: "Delete successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while deleting homework");
  }
};

export { addReply, getAllUsersReplies, deleteReply };
