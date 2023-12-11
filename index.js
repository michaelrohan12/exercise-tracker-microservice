const express = require("express");
let mongoose = require("mongoose");
const cors = require("cors");
let bodyParser = require("body-parser");
const { ObjectId } = require("mongoose").Types;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/public", express.static(__dirname + "/public"));

// Set up event listeners for connection success and failure
mongoose.connection.on("connected", () => {
  console.log("Connected to the database");
});

// Handle the error appropriately, e.g., terminate the application or retry the connection
mongoose.connection.on("error", (err) => {
  console.error("Error connecting to the database:", err.message);
});

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Used the `once` method to listen to the 'open' event, which only fires once
mongoose.connection.once("open", () => {
  console.log("Connection to the database opened");
});

// Create MongoDB Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true,
  },
  exercises: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
});

// Model
const User = mongoose.model("User", userSchema);

//Mounted body-parser to Parse POST Requests
app.use(bodyParser.urlencoded({ extended: false }));

//GET API to serve an html file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// First API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

/*
- POST to /api/users with form data username to create a new user and 
the returned response from POST /api/users with form data username will be 
an object with username and _id properties
*/
app.route("/api/users").post(async (req, res) => {
  const { username } = req.body;
  try {
    const newUser = await User.create({ username });
    res.json({ username: newUser.username, _id: newUser._id });
  } catch (err) {
    console.error("Error creating user:", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

/*
- GET request to /api/users to get a list of all users and returns an array.
- Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.
*/
app.route("/api/users").get(async (req, res) => {
  try {
    const allUsers = await User.find({}, "username _id");
    const orderedUsers = allUsers.map((user) => ({
      username: user.username,
      _id: user._id,
    }));
    res.json(orderedUsers);
  } catch (err) {
    console.error("Error in retrieving users:", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

/*
- POST to /api/users/:_id/exercises with form data description, duration, and optionally date.
- If no date is supplied, the current date will be used.
- The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.
*/
app.route("/api/users/:id/exercises").post(async (req, res) => {
  const { id } = req.params;
  const { description, duration, date } = req.body;

  const newExercise = {
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $push: { exercises: newExercise } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({ error: "User not found" });
    }

    const response = {
      username: updatedUser.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date,
      _id: updatedUser._id,
    };

    res.json(response);
  } catch (err) {
    console.error("Error while updating exercises of user: " + err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

function formatDate(date) {
  return date && isValidDate(date) ? new Date(date) : null;
}

/*
- GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
- A request to a user's log GET /api/users/:_id/logs returns a user object with a count property
representing the number of exercises that belong to that user.
- A GET request to /api/users/:_id/logs will return the user object with a log array of all the exercises added.
- Each item in the log array that is returned from GET /api/users/:_id/logs is an object
that has a description, duration, and date properties
- The description property of any object in the log array that is returned from GET /api/users/:_id/logs is a string.
- The duration property of any object in the log array that is returned from GET /api/users/:_id/logs is a number.
- The date property of any object in the log array that is returned from GET /api/users/:_id/logs is a string.
- We can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user,
from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
*/
app.route("/api/users/:id/logs").get(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const fromDate = formatDate(req.query.from);
  const toDate = formatDate(req.query.to);
  const parsedLimit = req.query.limit ? parseInt(req.query.limit) : null;
  const limitValue =
    !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : null;

  try {
    const userData = await User.findById(id).lean();

    if (fromDate) {
      userData.exercises = userData.exercises.filter(
        (exercise) => new Date(exercise.date) >= fromDate
      );
    }

    if (toDate) {
      userData.exercises = userData.exercises.filter(
        (exercise) => new Date(exercise.date) <= toDate
      );
    }

    userData.exercises = userData.exercises.reverse();

    if (limitValue) {
      userData.exercises = userData.exercises.slice(0, limitValue);
    }

    res.json({
      username: userData.username,
      count: userData.exercises.length,
      _id: userData._id,
      log: userData.exercises.map(({ _id, ...rest }) => rest),
    });
  } catch (err) {
    console.error("Error while retrieving logs", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

// App listening via port 3000
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
