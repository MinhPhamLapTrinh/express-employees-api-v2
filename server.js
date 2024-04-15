import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
env.config();
import cors from "cors";
import * as employeeService from "./employee-service.js";
import jwt from "jsonwebtoken";
import passport from "passport";
import passportJWT, { Strategy } from "passport-jwt";

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

// add passport as application-level middleware
app.use(passport.initialize());

const app = express();
const PORT = process.env.PORT || 4000; // Port number  to run the server
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post("/register", async (req, res) => {
  await employeeService
    .registerOwner(req.body)
    .then((msg) => {
      res.json({ message: msg });
    })
    .catch((err) => {
      res.status(422).json({ message: err });
    });
});

app.post("/login", async (req, res) => {
  await employeeService
    .checkOwner(req.body)
    .then((user) => {
      let payload = {
        _id: user._id,
        username: user.username,
      };
      // Create token and pass it to client side
      let token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.json({ message: user, token: token });
    })
    .catch((err) => {
      console.log(err);
      res.status(422).json({ message: err });
    });
});

app.post("/check-in", (req, res) => {
  const pin = req.body.pin; // get the pin from the request body
  const selection = req.body.selection;
  employeeService
    .checkInEmployee(pin)
    .then((emp) => {
      res.redirect(`/${selection}/${emp._id}`);
    })
    .catch((err) => {
      res.status(422).send({ message: err });
    });
});

app.get("/clock-in/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const msg = await employeeService.employeeClockIn(id);

    res.json({ message: msg });
  } catch (err) {
    res.status(422).send({ message: err });
  }
});

app.get("/clock-out/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const msg = await employeeService.employeeClockOut(id);

    res.json({ message: msg });
  } catch (err) {
    res.status(422).send({ message: err });
  }
});
// Add - employee
app.post(
  "/add-employee",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    employeeService
      .addEmployee(req.body.name, req.body.uniqueNum)
      .then((msg) => {
        res.json({ message: msg });
      })
      .catch((err) => {
        res.status(422).send({ message: err });
      });
  }
);

app.get("/employee/:uniqueNum", async (req, res) => {
  const uniqueNum = req.params.uniqueNum;
  await employeeService
    .checkInEmployee(uniqueNum)
    .then((emp) => {
      res.json(emp);
    })
    .catch((err) => {
      res.status(422).send({ message: err });
    });
});

app.get(
  "/all-employee",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await employeeService
      .getAllEmployee()
      .then((emp) => {
        res.json(emp);
      })
      .catch((err) => {
        res.status(422).send({ message: err });
      });
  }
);

app.post(
  "/biweekly-work-report",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { startDate, endDate } = req.body;
    try {
      const msg = await employeeService.getAllEmployeeByDate(
        new Date(startDate),
        new Date(endDate)
      );
      res.json(msg);
    } catch (err) {
      res.status(422).send({ message: err });
    }
  }
);

app.put(
  "/update-employee/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const id = req.params.id;

    const { time, field, recordID, totalHours } = req.body;
    await employeeService
      .updateEmployeeTime(id, time, field, recordID, totalHours)
      .then((emp) => res.json(emp))
      .catch((err) => {
        res.status(422).send({ message: err });
      });
  }
);

app.delete(
  "/all-employee/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const id = req.params.id;
    await employeeService
      .removeEmployee(id)
      .then((emp) => {
        res.json(emp);
      })
      .catch((err) => {
        res.status(422).json({ error: err });
      });
  }
);

employeeService
  .connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API is running at ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("unable to start the server: " + err);
    process.exit();
  });
