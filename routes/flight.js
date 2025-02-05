// Import express
const express = require("express");

// Import mongoose
const mongoose = require("mongoose");

// Create a router for Flight
const router = express.Router();

// Import the Flight model
const Flight = require("../models/flight");

// Import the Airport controller functions
const {
  getFlights,
  getFlight,
  addNewFlight,
  updateFlight,
  deleteFlight,
} = require("../controllers/flight");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// Enable timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

// GET /flights - Get the details of all flights from the database.
router.get("/", async (req, res) => {
  try {
    const departureAirport = req.query.departureAirport;
    const arrivalAirport = req.query.arrivalAirport;
    const departureDateTime = req.query.departureDateTime;
    const flights = await getFlights(
      departureAirport,
      arrivalAirport,
      departureDateTime
    );
    res.status(200).send(flights);
  } catch (error) {
    res
      .status(400)
      .send({ error: `Error fetching flights: ${error._message}` });
  }
});

// GET /flights/:id - Get the details of a specific flight from the database.
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        error: `Unrecognised MongoDB ID format: ${id}!`,
      });
    }
    const flight = await getFlight(id);
    if (flight) {
      res.status(200).send(flight);
    } else {
      res.status(400).send({ error: `No such flight with ID: ${id} found!` });
    }
  } catch (error) {
    res.status(400).send({
      error: `Error fetching flight: ${error._message}`,
    });
  }
});

// POST /flights - Add new flight details to the database.
router.post("/", async (req, res) => {
  try {
    // Retrieve the required data from req.body.
    const departureDateTime = req.body.departureDateTime;
    const arrivalDateTime = req.body.arrivalDateTime;
    const departureAirport = req.body.departureAirport;
    const arrivalAirport = req.body.arrivalAirport;
    const flightNumber = req.body.flightNumber;
    const price = req.body.price;

    // Check if all required fields are filled up.
    if (
      !departureDateTime ||
      !arrivalDateTime ||
      !departureAirport ||
      !arrivalAirport ||
      !flightNumber ||
      !price
    ) {
      // Sends error to frontend if conditions are not met.
      return res.status(400).send({
        error: `The flight's departure date & time, arrival date & time, departure & arrival airport as well as flightNumber must be provided!`,
      });
    }

    // Convert to dayjs objects for validation
    const dayjsDepartureUTC = dayjs(departureDateTime);
    const dayjsArrivalUTC = dayjs(arrivalDateTime);

    // Validate if the Date-Time format is valid
    if (!dayjsDepartureUTC.isValid() || !dayjsArrivalUTC.isValid()) {
      return res.status(400).send({
        error:
          "Invalid date-time format. Please select valid departure & arrival date-time!",
      });
    }

    // Convert to MYT time for real time check
    const dayjsDepartureMYT = dayjsDepartureUTC.tz("Asia/Kuala_Lumpur");
    const dayjsArrivalMYT = dayjsArrivalUTC.tz("Asia/Kuala_Lumpur");

    // Get the current time in MYT (For past date/time check)
    const nowMYT = dayjs().tz("Asia/Kuala_Lumpur");

    // Check if departure adn arrival details are not in the past MYT
    if (
      dayjsDepartureMYT.isBefore(nowMYT) ||
      dayjsArrivalMYT.isBefore(nowMYT)
    ) {
      return res.status(400).send({
        error: "Departure/Arrival date, time or both cannot be in the past!",
      });
    }

    // Check if the full DateTime is exactly the same (UTC)
    if (dayjsDepartureUTC.isSame(dayjsArrivalUTC)) {
      return res.status(400).send({
        error: "Departure and arrival cannot have the exact same date & time!",
      });
    }

    // Full Time Validation (UTC) (Departure)
    if (dayjsDepartureUTC.isAfter(dayjsArrivalUTC)) {
      return res.status(400).send({
        error: "Departure time cannot be after the arrival time!",
      });
    }

    // Full Time Validation (UTC) (Arrival)
    if (dayjsArrivalUTC.isBefore(dayjsDepartureUTC)) {
      return res.status(400).send({
        error: "Arrival time cannot be before the departure time!",
      });
    }

    // Check if an identical flight already exists
    const duplicateFlight = await Flight.findOne({
      departureDateTime,
      arrivalDateTime,
      departureAirport,
      arrivalAirport,
      flightNumber,
    });

    if (duplicateFlight) {
      return res.status(400).send({
        error: "This exact flight already exists in the database!",
      });
    }

    // Check if the flight number is already used
    const existingFlightNumber = await Flight.findOne({ flightNumber });
    if (existingFlightNumber) {
      return res.status(400).send({
        error: `The flight number '${flightNumber}' is already in use. Please choose another one!`,
      });
    }

    // If no errors, add the new airport
    const newFlight = await addNewFlight(
      departureDateTime,
      arrivalDateTime,
      departureAirport,
      arrivalAirport,
      flightNumber,
      price
    );

    // Sends the newly created airport data back to the frontend with 201 created status for successful creation.
    res.status(201).send(newFlight);
  } catch (error) {
    // Sends error to frontend if the the new airport could not be added at all.
    res.status(400).send({
      error: error._message,
    });
  }
});

// PUT /airports/:id - Update the details of a specific airport in the database.
router.put("/:id", async (req, res) => {
  try {
    // Retrieve the required data from req.body.
    const id = req.params.id;
    const departureDateTime = req.body.departureDateTime;
    const arrivalDateTime = req.body.arrivalDateTime;
    const departureAirport = req.body.departureAirport;
    const arrivalAirport = req.body.arrivalAirport;
    const flightNumber = req.body.flightNumber;
    const price = req.body.price;

    // Checks if the ID is a valid MongoDB ID.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        error: `Unrecognised MongoDB ID format: ${id}!`,
      });
    }

    // Checks if there exists a flight with retrieved ID
    const existingFlightOne = await Flight.findById(id);
    if (!existingFlightOne) {
      // Sends error to frontend if no matching airport is found
      return res.status(400).send({
        error: `No such flight with ID: ${id} found!`,
      });
    }

    // Checks if at least one field is changed.
    const notUpdatedFlight =
      existingFlightOne.departureDateTime === departureDateTime &&
      existingFlightOne.arrivalDateTime === arrivalDateTime &&
      existingFlightOne.departureAirport === departureAirport &&
      existingFlightOne.arrivalAirport === arrivalAirport &&
      existingFlightOne.flightNumber === flightNumber &&
      existingFlightOne.price === price;

    if (notUpdatedFlight) {
      // Sends error to frontend if neither field was updated.
      return res.status(400).send({
        error: `No changes were made to the flight details that require an update!`,
      });
    }

    // Check if all required fields are filled up.
    if (
      !departureDateTime ||
      !arrivalDateTime ||
      !departureAirport ||
      !arrivalAirport ||
      !flightNumber ||
      !price
    ) {
      // Sends error to frontend if conditions are not met.
      return res.status(400).send({
        error: `The flight's departure date & time, arrival date & time, departure & arrival airport as well as flightNumber must be provided!`,
      });
    }

    // Convert to dayjs objects for validation
    const dayjsDepartureUTC = dayjs(departureDateTime);
    const dayjsArrivalUTC = dayjs(arrivalDateTime);

    // Validate if the Date-Time format is valid
    if (!dayjsDepartureUTC.isValid() || !dayjsArrivalUTC.isValid()) {
      return res.status(400).send({
        error:
          "Invalid date-time format. Please select valid departure & arrival date-time!",
      });
    }

    // Convert to MYT time for real time check
    const dayjsDepartureMYT = dayjsDepartureUTC.tz("Asia/Kuala_Lumpur");
    const dayjsArrivalMYT = dayjsArrivalUTC.tz("Asia/Kuala_Lumpur");

    // Get the current time in MYT (For past date/time check)
    const nowMYT = dayjs().tz("Asia/Kuala_Lumpur");

    // Check if departure adn arrival details are not in the past MYT
    if (
      dayjsDepartureMYT.isBefore(nowMYT) ||
      dayjsArrivalMYT.isBefore(nowMYT)
    ) {
      return res.status(400).send({
        error: "Departure/Arrival date, time or both cannot be in the past!",
      });
    }

    // Check if the full DateTime is exactly the same (UTC)
    if (dayjsDepartureUTC.isSame(dayjsArrivalUTC)) {
      return res.status(400).send({
        error: "Departure and arrival cannot have the exact same date & time!",
      });
    }

    // Full Time Validation (UTC) (Departure)
    if (dayjsDepartureUTC.isAfter(dayjsArrivalUTC)) {
      return res.status(400).send({
        error: "Departure time cannot be after the arrival time!",
      });
    }

    // Full Time Validation (UTC) (Arrival)
    if (dayjsArrivalUTC.isBefore(dayjsDepartureUTC)) {
      return res.status(400).send({
        error: "Arrival time cannot be before the departure time!",
      });
    }

    // Check if an identical flight already exists
    const duplicateFlight = await Flight.findOne({
      departureDateTime,
      arrivalDateTime,
      departureAirport,
      arrivalAirport,
      flightNumber,
    });

    if (duplicateFlight) {
      return res.status(400).send({
        error: "This exact flight already exists in the database!",
      });
    }

    // Check if the flight number is already used
    const existingFlightNumber = await Flight.findOne({ flightNumber });
    if (existingFlightNumber) {
      return res.status(400).send({
        error: `The flight number '${flightNumber}' is already in use. Please choose another one!`,
      });
    }

    // If no errors above, update the airport details.
    const updatedFlight = await updateFlight(
      departureDateTime,
      arrivalDateTime,
      departureAirport,
      arrivalAirport,
      flightNumber,
      price
    );

    // Sends the newly updated airport data back to the frontend with 200 OK status.
    res.status(200).send(updatedFlight);
  } catch (error) {
    res.status(400).send({
      error: `Error updating airport (ID: ${id}): ${error._message}`,
    });
  }
});

// DELETE /:id - Delete a specific airport from the database.
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        error: `Unrecognised MongoDB ID format: ${id}!`,
      });
    }
    const flight = await getFlight(id);
    if (!airport) {
      return res.status(404).send({
        error: `No match for a flight found with the ID: ${id}!`,
      });
    }
    await deleteFlight(id);
    res.status(200).send({
      message: `Flight with the provided ID: ${id} has been deleted!`,
    });
  } catch (error) {
    res.status(400).send({
      error: `Error deleting airport: ${error._message}`,
    });
  }
});

module.exports = router;
