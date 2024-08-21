// src/auth.js

import passport from "passport";
import passportJWT from "passport-jwt";
import env from "dotenv";

env.config();

// Set up JWT
let ExtractJWT = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

// Configure its options
let jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

jwtOptions.secretOrKey = process.env.JWT_SECRET_KEY;

let strategy = new JwtStrategy(jwtOptions, function (payload, next) {
  if (payload) {
    next(null, {
      _id: payload._id,
      username: payload.username,
    });
  } else {
    next(null, false);
  }
});

// tell passport to use our "strategy"
passport.use(strategy);

export { jwtOptions };
export default passport;
