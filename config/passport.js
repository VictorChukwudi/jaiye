import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { config } from 'dotenv'
config()
import User from "../models/userModel.js";
import {Strategy as GoogleStrategy }from "passport-google-oauth2";

const opts = {}
opts.jwtFormRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.SECRET_KEY

const passportConfig = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      const user = await User.findById(jwt_payload)

      if (!user) {
        return 
      }
    })
  )
}


const googleStrategy=(passport)=>{
  passport.use(
    new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:6700/api/users/social/google.auth',
    passReqToCallback: true,
  },
  async (request, accessToken, refreshToken, profile, done) => {
        try {
          const findUser = await User.findOne({
            $or: [
              { email: profile.emails[0].value },
              { google_ID: profile.id },
            ],
          });
          if (findUser) {
            await User.findOneAndUpdate(
              { email: profile.emails[0].value },
              { $set: { google_ID: profile.id } }
            );
            return done(null, findUser);
          } else {
            const user = new User({
              fullname: profile.displayName,
              google_ID: profile.id,
              email: profile.emails[0].value,
            });
            await user.save();
            await User.findOneAndUpdate(
              { email: profile.emails[0].value },
              { $set: { emailVerified: true } }
            );
            return done(null, user);
          }
        } catch (error) {
          console.log(error);
          return done(error, false);
        }
      }
))
 passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  })
}

export {
  googleStrategy
}