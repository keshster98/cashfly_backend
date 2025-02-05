// Load the Flight model.
const Flight = require("../models/flight");
const dayjs = require("dayjs");

// Get the details of all flights from the database.
const getFlights = async (
  departureAirport,
  arrivalAirport,
  departureDateTime
) => {
  if (
    departureAirport === "all" &&
    arrivalAirport === "all" &&
    departureDateTime === "all"
  ) {
    return await Flight.find()
      .populate("departureAirport")
      .populate("arrivalAirport");
  }

  // Fetch flights that match the criteria
  const flights = await Flight.find({
    departureAirport: departureAirport,
    arrivalAirport: arrivalAirport,
    departureDateTime: {
      $gt: departureDateTime,
      $lt: dayjs(`${dayjs(departureDateTime).format("YYYY-MM-DD")}T00:00:00`)
        .add(1, "day")
        .add(8, "hour")
        .toISOString(),
    },
  })
    .populate("departureAirport")
    .populate("arrivalAirport");

  return flights;
};

// Get the details of a specific flight from the database.
const getFlight = async (_id) => {
  const flight = await Flight.findById(_id);
  return flight;
};

// Add a new flight to the database.
const addNewFlight = async (
  departureDateTime,
  arrivalDateTime,
  departureAirport,
  arrivalAirport,
  flightNumber,
  price
) => {
  const newFlight = new Flight({
    departureDateTime,
    arrivalDateTime,
    departureAirport,
    arrivalAirport,
    flightNumber,
    price,
  });
  await newFlight.save();
  return newFlight;
};

// Update the details of a specific flight in the database.
const updateFlight = async (
  _id,
  departureDateTime,
  arrivalDateTime,
  departureAirport,
  arrivalAirport,
  flightNumber,
  price
) => {
  // Retrieve the flight document
  const flight = await Flight.findById(_id);

  // Directly update fields
  if (departureDateTime) flight.departureDateTime = departureDateTime;
  if (arrivalDateTime) flight.arrivalDateTime = arrivalDateTime;
  if (departureAirport) flight.departureAirport = departureAirport;
  if (arrivalAirport) flight.arrivalAirport = arrivalAirport;
  if (flightNumber) flight.flightNumber = flightNumber;
  if (price) flight.price = price;

  // Save to trigger pre-save middleware for duration
  await flight.save();

  return flight;
};

// Delete a specific flight from the database.
const deleteFlight = async (_id) => {
  const deletedFlight = await Flight.findByIdAndDelete(_id);
  return deletedFlight;
};

// Export the controller functions
module.exports = {
  getFlights,
  getFlight,
  addNewFlight,
  updateFlight,
  deleteFlight,
};
