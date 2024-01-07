import Class from "../models/classes.js";
import User from "../models/user.js";
import transporter from "../middleware/nodemailer.js";

const getCourseByUser = async (req, res) => {
  try {
    const userID = req.params.id;

    const courseInfo = await User.findOne({ _id: userID }, "courses").populate({
      path: "courses",
      select: "title teachers className",
      populate: {
        path: "teachers",
        model: "users",
        select: "fullname",
        options: { limit: 1 },
      },
    });
    // console.log(courseInfo);
    res.json({ courseInfo: courseInfo.courses });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching course info");
  }
};
const getCourseByID = async (req, res) => {
  const courseID = req.params.id;
  try {
    const courseInfo = await Class.findById(courseID);

    if (!courseInfo) {
      return res.status(404).json({ error: "Invalid course ID" });
    }

    res.json(courseInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { getCourseByUser, getCourseByID };
