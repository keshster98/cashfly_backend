// Create schema for order collection
const { Schema, model } = require("mongoose");

const bookingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  flight: {
    type: Schema.Types.ObjectId,
    ref: "Flight",
  },
  seats: {
    type: Array,
    required: true,
  },
  billplz_id: String, // the ID from the bill in billplz
  paid_at: Date,
});

const Booking = model("Booking", bookingSchema);
module.exports = Booking;
