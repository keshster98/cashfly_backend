// Create schema for user authentication
const { Schema, model } = require("mongoose");

/*
    Fields:

    - name
    - email
    - password
    - role
*/

// Setup the schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // Ensures the email entered by the user is unique.
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

// Converting the schema into a model
const User = model("User", userSchema);

// Exporting the model
module.exports = User;
