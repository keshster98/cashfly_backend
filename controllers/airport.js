// Load the Airport model.
const Airport = require("../models/airport");

// Get the details of all airports from the database.
const getAirports = async () => {
  const airports = await Airport.find();
  return airports;
};

// Get the details of a specific airport from the database.
const getAirport = async (_id) => {
  const airport = await Airport.findById(_id);
  return airport;
};

// Add a new airport to the database.
const addNewAirport = async (name, location, code) => {
  const newAirport = new Airport({
    name,
    location,
    code,
  });
  await newAirport.save();
  return newAirport;
};

// Update the details of a specific airport in the database.
const updateAirport = async (_id, name, location, code) => {
  const updatedAirport = await Airport.findByIdAndUpdate(
    _id,
    {
      name,
      location,
      code,
    },
    {
      new: true,
    }
  );
  return updatedAirport;
};

// Delete a specific airport from the database.
const deleteAirport = async (_id) => {
  const deletedAirport = await Airport.findByIdAndDelete(_id);
  return deletedAirport;
};

// Export the controller functions
module.exports = {
  getAirports,
  getAirport,
  addNewAirport,
  updateAirport,
  deleteAirport,
};
