import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";

import { env } from "./env.js";
import { User } from "../models/User.js";

export const configurePassport = () => {
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value?.toLowerCase() || null;
            if (!email) return done(new Error("Google account has no email"), null);

            let user = await User.findOne({ email });
            if (!user) {
              user = await User.create({
                name: profile.displayName || email.split("@")[0],
                email,
                password: null,
                profileImage: profile.photos?.[0]?.value || "",
                provider: "google",
                providerId: profile.id,
                role: "user",
                isVerified: true,
                phone: "",
                addresses: [],
                defaultAddressId: null,
              });
            }
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  }

  if (env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: env.FACEBOOK_APP_ID,
          clientSecret: env.FACEBOOK_APP_SECRET,
          callbackURL: env.FACEBOOK_CALLBACK_URL,
          profileFields: ["id", "displayName", "emails", "photos"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value?.toLowerCase() || null;
            if (!email) return done(new Error("Facebook account has no verified email"), null);

            let user = await User.findOne({ email });
            if (!user) {
              user = await User.create({
                name: profile.displayName || email.split("@")[0],
                email,
                password: null,
                profileImage: profile.photos?.[0]?.value || "",
                provider: "facebook",
                providerId: profile.id,
                role: "user",
                isVerified: true,
                phone: "",
                addresses: [],
                defaultAddressId: null,
              });
            }
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export const hasStrategy = (name) => Boolean(passport._strategy(name));