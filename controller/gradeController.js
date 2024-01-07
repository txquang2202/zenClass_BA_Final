import Class from "../models/classes.js";
import User from "../models/user.js";
import Grade from "../models/grades.js";
import GradeStruct from "../models/gradestructs.js";

const getAllGradeStructs = async (req, res) => {
  const classID = req.params.id;
  try {
    const gradestructs = await Class.findOne(
      { _id: classID },
      "gradestructs"
    ).populate({
      path: "gradestructs",
      select: "topic ratio",
    });
    //console.log(gradestructs.gradestructs);

    res.json({ gradestructs: gradestructs.gradestructs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching");
  }
};
const addGradeStruct = async (req, res) => {
  try {
    const classID = req.params.id;
    let { topic, ratio } = req.body;

    if (!topic) {
      topic = "New Topic";
    }
    if (!ratio) {
      ratio = 0;
    }

    const existTopic = await Class.findOne(
      { _id: classID },
      "gradestructs"
    ).populate({ path: "gradestructs", select: "topic" });
    const topicToCheck = topic;

    if (
      existTopic &&
      existTopic.gradestructs.some((item) => item.topic === topicToCheck)
    ) {
      return res.status(400).json({ message: "Topic already taken!" });
    }
    const newStruct = new GradeStruct({
      topic: topic,
      ratio: ratio,
    });
    await newStruct.save();
    const classGD = await Class.findById(classID);

    if (!classGD.gradestructs.includes(newStruct._id)) {
      classGD.gradestructs.push(newStruct._id);
      await classGD.save();
    }
    //them vao bang grade
    const classGrade = await Class.findOne({ _id: classID }, "grades");
    const newStructGrade = {
      topic: newStruct.topic,
      ratio: newStruct.ratio,
    };
    for (const gradeID of classGrade.grades) {
      const newGrade = await Grade.findOne({ _id: gradeID });

      if (
        newGrade &&
        !newGrade.grades.some((grade) => grade.topic === newStructGrade.topic)
      ) {
        newGrade.grades.push(newStructGrade);
        await newGrade.save();
      }
    }
    res.json({
      message: "Create new struct successfully!!",
      gradeStruct: newStruct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error.");
  }
};
const deleteGradeStruct = async (req, res) => {
  try {
    const structID = req.params.id;

    const classWithStruct = await Class.findOne({ gradestructs: structID });
    const classWithGrade = await Class.findOne(
      { gradestructs: structID },
      "grades"
    );
    const topicToBeUpdated = await GradeStruct.findById(structID);

    if (!classWithStruct) {
      return res.status(404).json({ message: "Structs not found!" });
    }
    //console.log(classWithGrade.grades);
    for (const gradeID of classWithGrade.grades) {
      const deleteGrade = await Grade.findOne({ _id: gradeID });
      if (deleteGrade) {
        const index = deleteGrade.grades.findIndex(
          (item) => item.topic === topicToBeUpdated.topic
        );
        if (index !== -1) {
          deleteGrade.grades.splice(index, 1);
          await deleteGrade.save();
        }
      }
    }
    classWithStruct.gradestructs = classWithStruct.gradestructs.filter(
      (id) => id.toString() !== structID
    );

    await classWithStruct.save();

    await GradeStruct.findByIdAndDelete(structID);

    res.json({ message: "Delete successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while deleting struct");
  }
};
const editGradeStruct = async (req, res) => {
  try {
    const { topic, ratio } = req.body;
    const structID = req.params.id;
    const updatedStruct = await GradeStruct.findById(structID);
    if (!updatedStruct) {
      return res.status(404).json({ message: "Grade struct not found!" });
    }
    const existTopic = await Class.findOne(
      { gradestructs: structID },
      "gradestructs"
    ).populate({ path: "gradestructs", select: "topic" });
    const topicToCheck = topic;

    if (
      existTopic &&
      existTopic.gradestructs.some((item) => item.topic === topicToCheck)
    ) {
      return res.status(400).json({ message: "Topic already taken!" });
    }
    const topicToBeUpdated = updatedStruct.topic;
    //const ratioToBeUpdated = updatedStruct.ratio;
    updatedStruct.topic = topic;
    updatedStruct.ratio = ratio;
    await updatedStruct.save();

    //sua bang grade
    const classGrade = await Class.findOne(
      { gradestructs: structID },
      "grades"
    );
    // console.log(classGrade.grades);
    const updatingValue = {
      topic: topic,
      ratio: ratio,
    };
    for (const gradeID of classGrade.grades) {
      const updateGrade = await Grade.findOne({ _id: gradeID });
      if (updateGrade) {
        const index = updateGrade.grades.findIndex(
          (item) => item.topic === topicToBeUpdated
        );
        if (index !== -1) {
          updateGrade.grades[index].topic = updatingValue.topic;
          updateGrade.grades[index].ratio = updatingValue.ratio;

          await updateGrade.save();
        }
      }
    }

    res.json({ message: "Grade struct updated successfully", updatedStruct });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while updating struct");
  }
};

const getAllGradeByClass = async (req, res) => {
  const classID = req.params.id;
  try {
    const grades = await Class.findOne({ _id: classID }, "grades").populate({
      path: "grades",
      select: "studentId fullName grades",
    });
    res.json({ grades: grades.grades });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching");
  }
};

const editStatusGrade = async (req, res) => {
  try {
    const { statusGrade } = req.body;
    const classID = req.params.id;
    const gradeOfClass = await Class.findById(classID);
    console.log(gradeOfClass);

    if (!gradeOfClass) {
      return res.status(404).json({ message: "Class not found!" });
    }

    gradeOfClass.statusGrade = statusGrade;
    await gradeOfClass.save();
    res.json({ message: "Status grade updated successfully", gradeOfClass });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching");
  }
};

const editClassGrade = async (req, res) => {
  try {
    const classID = req.params.id;
    const { studentID, newScore } = req.body;
    const classroom = await Class.findById(classID);
    if (!classroom) {
      return res.status(404).json({ message: "Class not found!" });
    }
    const updatedGrade = await Grade.findOne({
      studentId: studentID,
      _id: { $in: classroom.grades },
    });
    if (!updatedGrade) {
      return res.status(404).json({ message: "Grade not found!" });
    }
    updatedGrade.grades.forEach((score, index) => {
      score.score = newScore[index];
    });
    await updatedGrade.save();
    res.json({ message: "Grade updated successfully", updatedGrade });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while updating grade");
  }
};
const addGradeToClass = async (req, res) => {
  try {
    const classID = req.params.id;
    const grades = req.body.grades;
    let newGradesArray = [];
    let errorExists = false;

    const findDuplicates = await Class.findOne(
      { _id: classID },
      "grades"
    ).populate({ path: "grades", select: "_id studentId" });

    const gradestructs = await Class.findOne(
      { _id: classID },
      "gradestructs"
    ).populate({ path: "gradestructs", select: " topic" });

    for (const grade of grades) {
      const newGrades = gradestructs.gradestructs.map((gradestruct, index) => ({
        topic: gradestruct.topic,
        score: grade.grades[index].score,
      }));

      const newGrade = {
        studentId: grade.studentId,
        fullName: grade.fullName,
        grades: newGrades,
      };
      const existingIndex = newGradesArray.findIndex(
        (item) => item.studentId === newGrade.studentId
      );

      if (existingIndex !== -1) {
        newGradesArray[existingIndex].grades = newGrade.grades;
      } else {
        newGradesArray.push(newGrade);
      }
    }
    if (!gradestructs || !gradestructs.gradestructs) {
      return res.status(400).json({
        message: `Gradestruct not found in the specified class`,
      });
    }
    //check co khop ten hay khong
    const checkStudentID = await User.find();
    let errorStudent = null;
    for (const studentGrade of grades) {
      for (const student of checkStudentID) {
        if (
          student.userID === parseInt(studentGrade.studentId, 10) &&
          student.fullname !== studentGrade.fullName
        ) {
          errorExists = true;
          errorStudent = student;
          break;
        }
      }
      if (errorStudent) {
        return res.status(400).json({
          message: `The student with id: ${errorStudent.userID} has a mismatched fullname`,
          errorStudent: errorStudent,
        });
      }
    }
    //check neu trung thi update va loai ra khoi mang
    const studentIDs = findDuplicates.grades.map((grade) => grade.studentId);
    for (const studentGrade of grades) {
      if (studentIDs.includes(parseInt(studentGrade.studentId))) {
        const gradeID = findDuplicates.grades
          .filter(
            (grade) => grade.studentId === parseInt(studentGrade.studentId)
          )
          .map((grade) => grade._id);
        const editingGrade = await Grade.findOne({
          _id: gradeID,
        });
        editingGrade.grades.map((grade, index) => {
          grade.score = studentGrade.grades[index].score;
        });
        try {
          await editingGrade.save();
          const indexToRemove = newGradesArray.findIndex(
            (item) => item.studentId === studentGrade.studentId
          );
          if (indexToRemove !== -1) {
            newGradesArray.splice(indexToRemove, 1);
          }
        } catch (err) {
          return res.status(400).json({ message: err.message });
        }
      }
    }

    try {
      if (errorExists === false) {
        const addedGrades = await Grade.insertMany(newGradesArray);
        const classGrades = await Class.findById(classID);
        for (const grade of addedGrades) {
          if (!classGrades.grades.includes(grade._id)) {
            classGrades.grades.push(grade._id);
          }
        }
        await classGrades.save();
      } else {
        return res.status(500).json({
          message: `The student with id: ${errorStudent} has mismatch name!!!`,
        });
      }
    } catch (error) {
      return res.status(400).json({ message: err.message });
    }

    res.json({ message: "Grade added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while adding grade" });
  }
};
const deleteAllGrade = async (req, res) => {
  try {
    const classID = req.params.id;
    const classToBeDeleted = await Class.findById(classID);

    if (classToBeDeleted.grades.length === 0) {
      return res
        .status(400)
        .json({ message: "Don't have anything to delete!!" });
    }

    await Grade.deleteMany({ _id: { $in: classToBeDeleted.grades } });

    classToBeDeleted.grades = [];

    await classToBeDeleted.save();

    res.json({ message: "Delete successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while deleting struct");
  }
};

export {
  deleteGradeStruct,
  editGradeStruct,
  addGradeStruct,
  getAllGradeStructs,
  getAllGradeByClass,
  editClassGrade,
  addGradeToClass,
  deleteAllGrade,
  editStatusGrade,
};
