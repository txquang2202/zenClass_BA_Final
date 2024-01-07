import passport from "passport";
import LocalStrategy from "passport-local";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import env from "dotenv";
import GoogleStrategy from "passport-google-oauth20";
import FacebookStrategy from "passport-facebook";
import { createToken } from "./jwt.js";
import { createUserOauth } from "../controller/userController.js";

env.config();

passport.use(
  new LocalStrategy(async function verify(usernameOrEmail, password, cb) {
    try {
      const user = await User.findOne({
        $or: [
          { username: usernameOrEmail },
          { email: usernameOrEmail.toLowerCase() },
        ],
      });

      if (!user) {
        return cb(null, false, { message: "Người dùng không tồn tại!" });
      }

      const hashedPassword = await bcrypt.compare(password, user.password);
      if (!hashedPassword) {
        return cb(null, false, { message: "Mật khẩu không đúng." });
      }

      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BA_BASE_URL + "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const existingUser = await User.findOne({
          email: profile.emails[0].value,
        });

        if (existingUser) {
          const token = createToken(existingUser);
          return cb(null, { user: existingUser, token });
        } else {
          const userInfo = {
            username: profile.displayName,
            email: profile.emails[0].value,
            password: "",
          };

          const newUser = await createUserOauth(
            userInfo.username,
            userInfo.email,
            userInfo.password
          );

          const token = createToken(newUser);
          return cb(null, {
            user: newUser,
            token,
            message: "Register successfully!!",
          });
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.BA_BASE_URL + "/api/v1/auth/facebook/callback",
      profileFields: ["email"],
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const existingUser = await User.findOne({
          email: profile.emails[0].value,
        });

        if (existingUser) {
          //  console.log(profile);
          const token = createToken(existingUser);
          return cb(null, { user: existingUser, token });
        } else {
          const userInfo = {
            username: profile.displayName,
            email: profile.emails[0].value,
            password: "",
          };

          const newUser = await createUserOauth(
            userInfo.username,
            userInfo.email,
            userInfo.password
          );

          const token = createToken(newUser);
          return cb(null, {
            user: newUser,
            token,
            message: "Register successfully!!",
          });
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
