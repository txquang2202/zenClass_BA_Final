import multer from "multer";

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../frontEnd/public/assets/imgs/");
  },
  filename: function (req, file, cb) {
    cb(null, "img" + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("img");

export default upload;
