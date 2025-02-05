// Create schema for airports in Malaysia
const { Schema, model } = require("mongoose");

/*
    Fields:

    - name
    - location
    - code
*/

// Setup the schema
const airportSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Converting the schema into a model
const Airport = model("Airport", airportSchema);

// Exporting the model
module.exports = Airport;
