// Import express
const express = require("express");

// Import mongoose
const mongoose = require("mongoose");

// Create a router for Airport
const router = express.Router();

// Load the Airport model.
const Airport = require("../models/airport");

// Import the Airport controller functions
const {
  getAirports,
  getAirport,
  addNewAirport,
  updateAirport,
  deleteAirport,
} = require("../controllers/airport");

// GET /airports - Get the details of all airports from the database.
router.get("/", async (req, res) => {
  try {
    const airports = await getAirports();
    res.status(200).send(airports);
  } catch (error) {
    res
      .status(400)
      .send({ error: `Error fetching airports: ${error._message}` });
  }
});

// GET /airports/:id - Get the details of a specific airport from the database.
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        error: `Unrecognised MongoDB ID format: ${id}!`,
      });
    }
    const airport = await getAirport(id);
    if (airport) {
      res.status(200).send(airport);
    } else {
      res.status(400).send({ error: `No such airport with ID: ${id} found!` });
    }
  } catch (error) {
    res.status(400).send({
      error: `Error fetching airport: ${error._message}`,
    });
  }
});

// POST /airports - Add new airport details to the database.
router.post("/", async (req, res) => {
  // ReGex to validate IATA code format.
  const isValidCodeFormat = (code) => {
    // ReGex checks for 3 uppercase letters (A-Z)
    const codeRegex = /^[A-Z]{3}$/.test(code);
    return codeRegex;
  };

  try {
    // Retrieve the required data from req.body.
    const name = req.body.name;
    const location = req.body.location;
    const code = req.body.code;

    // Check if all 3 required fields are filled up.
    if (!name || !location || !code) {
      // Sends error to frontend if conditions are not met.
      return res.status(400).send({
        error: `The airport's name, location and IATA code is required!`,
      });
    }

    // Check if the airport code matches the IATA code format.
    if (!isValidCodeFormat(code)) {
      // Sends error to frontend if conditions are not met.
      return res.status(400).send({
        error: `Invalid IATA code format. Must be exactly 3 uppercase letters (A-Z)!`,
      });
    }

    // Checks if the airport being added is already in the database.
    const existingAirport = await Airport.findOne({ name, code });
    if (existingAirport) {
      // Sends error to frontend if a duplicate airport is found.
      return res.status(400).send({
        error: `${name} (${code}) has already been added to CASHFLY!`,
      });
    }

    // If no errors, add the new airport
    const newAirport = await addNewAirport(name, location, code);

    // Sends the newly created airport data back to the frontend with 201 created status for successful creation.
    res.status(201).send(newAirport);
  } catch (error) {
    // Sends error to frontend if the the new airport could not be added at all.
    res.status(400).send({
      error: error._message,
    });
  }
});

// PUT /airports/:id - Update the details of a specific airport in the database.
router.put("/:id", async (req, res) => {
  // ReGex to validate IATA code format.
  const isValidCodeFormat = (code) => {
    // ReGex checks for 3 uppercase letters (A-Z)
    const codeRegex = /^[A-Z]{3}$/.test(code);
    return codeRegex;
  };

  try {
    const id = req.params.id;
    const name = req.body.name;
    const location = req.body.location;
    const code = req.body.code;

    // Checks if the ID is a valid MongoDB ID.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        error: `Unrecognised MongoDB ID format: ${id}!`,
      });
    }

    // Checks if there exists an airport with retrieved ID
    const existingAirportOne = await Airport.findById(id);
    if (!existingAirportOne) {
      // Sends error to frontend if no matching airport is found
      return res.status(400).send({
        error: `No such airport with ID: ${id} found!`,
      });
    }

    // Checks if at least one field is changed.
    const notUpdatedAirport =
      existingAirportOne.name === name &&
      existingAirportOne.location === location &&
      existingAirportOne.code === code;
    if (notUpdatedAirport) {
      // Sends error to frontend if neither field was updated.
      return res.status(400).send({
        error: `No changes were made to the airport details that require an update!`,
      });
    }

    // Check if all 3 required fields are filled up.
    if (!name || !location || !code) {
      // Sends error to frontend if conditions are not met.
      return res.status(400).send({
        error: `The airport's name, location and IATA code is required!`,
      });
    }

    // Check if the airport code matches the IATA code format.
    if (!isValidCodeFormat(code)) {
      // Sends error to frontend if conditions are not met.
      return res.status(400).send({
        error: `Invalid IATA code format. Must be exactly 3 uppercase letters (A-Z)!`,
      });
    }

    // Checks if the airport being added is already in the database.
    const existingAirportTwo = await Airport.findOne({ name, code });
    if (existingAirportTwo) {
      // Sends error to frontend if a duplicate airport is found.
      return res.status(400).send({
        error: `${name} (${code}) has already been added to CASHFLY!`,
      });
    }

    // If no errors above, update the airport details.
    const updatedAirport = await updateAirport(id, name, location, code);

    // Sends the newly updated airport data back to the frontend with 200 OK status.
    res.status(200).send(updatedAirport);
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
        error: `Invalid ID format: ${id}. A valid MongoDB ObjectId is required!`,
      });
    }
    const airport = await getAirport(id);
    if (!airport) {
      return res.status(404).send({
        error: `Error: No match for an airport found with the ID: ${id}!`,
      });
    }
    await deleteAirport(id);
    res.status(200).send({
      message: `Alert: Airport with the provided ID: ${id} has been deleted!`,
    });
  } catch (error) {
    res.status(400).send({
      error: `Error deleting airport: ${error._message}`,
    });
  }
});

module.exports = router;
