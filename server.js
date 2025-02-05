// Import express
const express = require("express");

// Import mongoose
const mongoose = require("mongoose");

// Import cors
const cors = require("cors");

// Load the environment variables from .env to process.env
require("dotenv").config();

// Create the express app
const app = express();

// Middleware to handle JSON request
app.use(express.json());

// Setup cors policy
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/cashfly")
  .then(() => {
    // If MongoDB is successfully connected
    console.log(
      "MongoDB is successfully connected, database 'cashfly' is ready for use."
    );
  })
  .catch((error) => {
    // If there is an error connecting to MongoDB
    console.log(error);
  });

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the CashFly Airlines!");
});

// Start the server
app.listen(5555, () => {
  console.log(
    "CashFly's airline backend server is running at http://localhost:5555"
  );
});

// Get the other routes
const airportRouter = require("./routes/airport");
const flightRouter = require("./routes/flight");
const authRouter = require("./routes/user");

// Apply the routes
app.use("/airports", airportRouter);
app.use("/flights", flightRouter);
app.use("/auth", authRouter);
