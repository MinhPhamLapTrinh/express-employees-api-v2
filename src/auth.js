// src/auth.js

import passport from "passport";
import passportJWT from "passport-jwt";
import env from "dotenv";

// Using Passport-HTTP for testing
// https://www.passportjs.org/packages/passport-http/
import { BasicStrategy } from "passport-http";
import Owner from "./model/owner.js";

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

const ownerModel = new Owner();
// Set up Basic Authentication
let basicStrategy = new BasicStrategy(async (username, password, done) => {
  try {
    const verifiedOwner = ownerModel.verifyOwner({
      username: username,
      password: password,
    });

    if (!verifiedOwner) {
      return done(null, false);
    }

    return done(null, verifiedOwner);
  } catch (err) {
    return done(err);
  }
});

// Tell passport to use our "strategy"
passport.use(strategy);
passport.use(basicStrategy);

export { jwtOptions };
export default passport;
