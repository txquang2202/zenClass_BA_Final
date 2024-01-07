import env from "dotenv";
import passport from "passport";
import "../middleware/passport.js";
import { createToken, authenticateToken } from "../middleware/jwt.js";
import transporter from "../middleware/nodemailer.js";
import crypto from "crypto";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { ChildProcess } from "child_process";

env.config();

// authcontroller.js

const handleLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Server error." });
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password." });
    }
    req.logIn(user, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error during login." });
      }
      const token = createToken(user);
      return res.json({ token });
    });
  })(req, res, next);
};
//google login
const initGG = passport.authenticate("google", {
  scope: ["profile", "email"],
});
const authenticateGG = passport.authenticate("google", {
  failureRedirect: `${process.env.BASE_URL}/signin?message="Failed!!!"`,
});
const handleAuthenticationGG = (req, res) => {
  const token = req.user.token;
  res.redirect(`${process.env.BASE_URL}/home?token=${token}`);
};
//facebook login
const initFB = passport.authenticate("facebook", {
  scope: ["email"],
});
const authenticateFB = passport.authenticate("facebook", {
  failureRedirect: `${process.env.BASE_URL}/signin?message="The email address is not registered!!!"`,
});
const handleAuthenticationFB = (req, res) => {
  const token = req.user.token;
  res.redirect(`${process.env.BASE_URL}/home?token=${token}`);
};

const generateUniqueToken = () => {
  const token = crypto.randomBytes(16).toString("hex");
  return token;
};
const sendEmail = async (email, verificationToken) => {
  const verificationLink = `${process.env.BA_BASE_URL}/api/v1/verify?token=${verificationToken}`;

  const mailOptions = {
    from: "Zen Class Corporation stellaron758@gmail.com",
    to: email,
    subject: "[Email Verification]",
    html: `Click the following link to verify your email: <a href="${verificationLink}">Verification Links</a>`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve();
      }
    });
  });
};
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return res.status(400).send("Invalid verification token.");
  }

  user.verificationToken = undefined;
  user.isVerified = true;
  await user.save();
  res.redirect(
    `${process.env.BASE_URL}/signin?verified="Email verified successfully!!!"`
  );
};
const resetPassword = async (req, res) => {
  const verificationToken = generateUniqueToken();
  const verificationLink = `${process.env.BA_BASE_URL}/api/v1/verifyReset?token=${verificationToken}`;
  const email = req.body.email;
  const existEmail = await User.findOne({ email });

  if (!existEmail) {
    return res.status(400).json({ message: "Email is not exist!" });
  }

  try {
    await User.updateOne(
      { email: email },
      { $set: { verificationToken: verificationToken } }
    );
  } catch (error) {
    console.error("Error saving verificationToken to database:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  const mailOptions = {
    from: "Zen Class Corporation stellaron758@gmail.com",
    to: email,
    subject: "[Reset Password]",
    html: `Your reset password link is: <a href="${verificationLink}">Reset your password</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent");
    return res.status(200).json({ message: "Reset email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const verifyReset = async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return res.status(400).send("Invalid verification token.");
  }

  // user.verificationToken = undefined;
  await user.save();
  setTimeout(() => {
    res.redirect(`${process.env.BASE_URL}/reset-password/${user._id}`);
  }, 3000);
};
const updatePassword = async (req, res) => {
  const { id } = req.params;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findById(id);
  if (!user) {
    return res.status(400).send("User not found");
  }
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({ message: "Password updated." });
};
export {
  handleLogin,
  sendEmail,
  verifyEmail,
  generateUniqueToken,
  resetPassword,
  verifyReset,
  updatePassword,
  initGG,
  authenticateGG,
  handleAuthenticationGG,
  initFB,
  authenticateFB,
  handleAuthenticationFB,
};
