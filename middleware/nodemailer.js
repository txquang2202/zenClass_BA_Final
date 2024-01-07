import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "stellaron758@gmail.com",
    pass: "qhho vtvd gtrr zsfn",
  },
});
export default transporter;
