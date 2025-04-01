const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  fullName: { type: String },
  courseId: { type: String }, 
  scan_time: { type: Date, default: Date.now },
  status: { type: String, enum: ["Present", "Late", "Absent"], default: "Present" },
  location_data: {
    latitude: Number,
    longitude: Number,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
