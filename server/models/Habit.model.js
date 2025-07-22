const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true }, // e.g., "Drink Water", "Journal"
    streak: { type: Number, default: 0 },
    lastCompleted: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habit", habitSchema);
