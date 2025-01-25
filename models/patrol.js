import mongoose from "mongoose";

const PatrolSchema = new mongoose.Schema({
  patrolId: {
    type: String,
    required: true,
  }, // Patrol ID
  vistiedVenues: [
    {
      venueId: {
        type: String,
        required: true,
      }, // Venue ID
      visitedAt: {
        type: Date,
        default: Date.now,
      }, // Time of visit
    },
  ],
  visitedPevilions: [
    {
      pevilionName: {
        type: String,
        required: true,
      },
      visitedAt: {
        type: Date,
        default: Date.now,
      },
      visitedCount: {
        type: Number,
        required: true,
      },
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  }, // Track when last updated
});

const Patrol = mongoose.models.Patrol || mongoose.model("Patrol", PatrolSchema);

export default Patrol;
