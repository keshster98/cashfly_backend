// Create schema for flight data
const { Schema, model } = require("mongoose");

// Import dayjs library
const dayjs = require("dayjs");

/*
    Fields:

    - Departure Date & Time
    - Arrival Date & Time
    - Departure Airport (name, location, code populated by airport schema)
    - Arrival Airport (name, location, code populated by airport schema)
    - Flight Number
    - Duration (created by the schema based on the difference between the arrival and departure time)
*/

// Setup the schema
const flightSchema = new Schema(
  {
    departureDateTime: {
      type: Date,
      required: true,
    },
    arrivalDateTime: {
      type: Date,
      required: true,
    },
    departureAirport: {
      type: Schema.Types.ObjectId,
      ref: "Airport",
    },
    arrivalAirport: {
      type: Schema.Types.ObjectId,
      ref: "Airport",
    },
    flightNumber: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
    },
    seats: [
      {
        seatNumber: { type: String, required: true },
        isBooked: { type: Boolean, default: false }, // Default: all seats available
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate duration
flightSchema.pre("save", function (next) {
  if (!this.departureDateTime || !this.arrivalDateTime) {
    return next(new Error("Missing departureDateTime or arrivalDateTime"));
  }

  const departure = dayjs(this.departureDateTime);
  const arrival = dayjs(this.arrivalDateTime);

  if (!departure.isValid() || !arrival.isValid()) {
    return next(new Error("Invalid departureDateTime or arrivalDateTime"));
  }

  // Calculate duration in hours and minutes
  const durationMinutes = arrival.diff(departure, "minute");
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  // Store duration as "X Hrs Y Mins"
  this.duration = `${hours} Hrs ${minutes} Mins`;

  if (!this.seats || this.seats.length === 0) {
    const rows = 5;
    const cols = ["A", "B", "C", "D"];
    const seatLayout = [];

    for (let row = 1; row <= rows; row++) {
      for (let col of cols) {
        seatLayout.push({ seatNumber: `${row}${col}`, isBooked: false });
      }
    }
    this.seats = seatLayout;
  }

  next();
});

// Converting the schema into a model
const Flight = model("Flight", flightSchema);

// Exporting the model
module.exports = Flight;
