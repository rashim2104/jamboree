import mongoose from "mongoose";

const PavilionSchema = new mongoose.Schema({
  pavilion: { type: String, required: true }, // Pavilion name
  visitedCount: { type: Number, required: true }, // Number of visits
});

const PatrolSchema = new mongoose.Schema({
  patrolId: { type: String, required: true, unique: true }, // Patrol ID
  visitedVenues: { type: [String], default: [] }, // Initially empty array of venue IDs
  visitedPavilions: { type: [PavilionSchema], default: [] }, 
  lastUpdated: {
    type: Date,
    default: Date.now,
  }, // Track when last updated
});

// Check if the model is already defined
const Patrol = mongoose.models.Patrol || mongoose.model("Patrol", PatrolSchema);

export default Patrol;
