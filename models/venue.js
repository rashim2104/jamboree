const VenueSchema = new mongoose.Schema({
  venueName: {
    type: String,
    required: true,
  }, // Name of the child venue
  parentTheme: {
    type: String,
    required: true,
  }, // Parent theme (SDG, WAGGGS, etc.)
  isAvailable: {
    type: Boolean,
    default: true,
  }, // Venue availability (true = green, false = red)
  capacity: {
    type: Number,
    required: true,
  }, // Maximum allowed attendees per venue
  attendees: [
    {
      date: {
        type: Date,
        required: true,
      }, // Date object
      count: {
        type: Number,
        default: 0,
      }, // Number of attendees for the date
    },
  ],
  totalAttendees: {
    type: Number,
    default: 0,
  }, // Total attendees count
  lastUpdated: {
    type: Date,
    default: Date.now,
  }, // Track when last updated
});

module.exports = mongoose.model("Venue", VenueSchema);
