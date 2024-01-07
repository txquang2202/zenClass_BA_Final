import Class from "../models/classes.js";
import User from "../models/user.js";
import gradesReview from "../models/gradesReview.js";
import Comment from "../models/comments.js";
import Grade from "../models/grades.js";

const getAllGradeReviews = async (req, res) => {
  const classID = req.params.id;
  try {
    const gradereviews = await Class.findOne(
      { _id: classID },
      "gradereviews"
    ).populate({
      path: "gradereviews",
      select:
        "avt fullname userID date typeGrade currentGrade expectationGrade explaination",
    });
    // const gradeReviews = await Class.findOne({ _id: classID }, "gradereviews");
    res.json({ gradereviews: gradereviews?.gradereviews });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching");
  }
};

const addGradeReviewByID = async (req, res) => {
  try {
    const classID = req.params.id;
    const {
      avt,
      fullname,
      userID,
      date,
      typeGrade,
      currentGrade,
      expectationGrade,
      explaination,
    } = req.body;
    const classGR = await Class.findById(classID);

    if (!typeGrade) {
      return res.status(400).json({ message: "Type grade is empty!" });
    }
    if (currentGrade < 0 || currentGrade > 10) {
      return res.status(400).json({ message: "Invalid current grade range!!" });
    }
    if (expectationGrade < 0 || expectationGrade > 10) {
      return res
        .status(400)
        .json({ message: "Invalid expectation grade range!!" });
    }
    if (!currentGrade) {
      return res.status(400).json({ message: "Current grade is empty!" });
    }
    if (!expectationGrade) {
      return res.status(400).json({ message: "Expectation grade is empty!" });
    }
    if (!explaination) {
      return res.status(400).json({ message: "Explaination is empty!" });
    }
    for (const gradeID of classGR.grades) {
      const grade = await Grade.findOne({ _id: gradeID });
      if (grade.studentId === userID) {
        for (const topic of grade.grades) {
          if (topic.topic === typeGrade) {
            if (topic.score !== parseInt(currentGrade)) {
              //   console.log(typeof topic.score, typeof currentGrade);
              return res.status(400).json({ message: "Wrong current grade!!" });
            }
          }
        }
      }
    }
    const newGR = new gradesReview({
      avt: avt,
      fullname: fullname,
      userID: userID,
      date: date,
      typeGrade: typeGrade,
      currentGrade: currentGrade,
      expectationGrade: expectationGrade,
      explaination: explaination,
    });
    await newGR.save();

    if (!classGR.gradereviews?.includes(newGR._id)) {
      classGR.gradereviews?.push(newGR._id);
      await classGR.save();
    }
    res.json({
      message: "Create grade review successfully!!",
      gradeReview: newGR,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error.");
  }
};

const deleteReviewByID = async (req, res) => {
  try {
    const reviewID = req.params.id;
    const approve = req.body.approve;
    const reviewCMT = await gradesReview.findById(reviewID);

    if (!reviewCMT) {
      return res.status(404).json({ message: "Review not found!" });
    }

    const findClass = await Class.findOne({ gradereviews: { $in: reviewID } });

    if (!findClass) {
      return res.status(404).json({ message: "Class not found!" });
    }

    const findUser = await User.findOne({ userID: reviewCMT.userID });

    if (!findUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    const classWithReview = await Class.findOne({ gradereviews: reviewID });

    if (!classWithReview) {
      return res
        .status(404)
        .json({ message: "Review not associated with any class!" });
    }

    if (approve === 1) {
      for (const gradeID of findClass.grades) {
        const updatingGrade = await Grade.findOne({ _id: gradeID });
        if (updatingGrade.studentId === findUser.userID) {
          for (const grade of updatingGrade.grades) {
            if (grade.topic === reviewCMT.typeGrade) {
              grade.score = reviewCMT.expectationGrade;
              await updatingGrade.save();
            }
          }
        }
      }
    }

    await Comment.deleteMany({ _id: { $in: reviewCMT.comments } });

    classWithReview.gradereviews = classWithReview.gradereviews.filter(
      (id) => id.toString() !== reviewID
    );
    await classWithReview.save();

    await gradesReview.findByIdAndDelete(reviewID);

    res.json({ message: "Delete successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while deleting review");
  }
};

export { getAllGradeReviews, addGradeReviewByID, deleteReviewByID };
