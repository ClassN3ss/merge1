const Enroll = require("../models/Enroll");
const Class = require("../models/Class");

exports.getEnrolledSubjects = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const enrolled = await Enroll.find({ student: studentId, approved: true }).populate("classId");

    const now = new Date();

    const subjects = enrolled.map(e => ({
      courseCode: e.classId?.courseCode,
      courseName: e.classId?.courseName,
      section: e.classId?.section,
      classId: e.classId?._id,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
    }));

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "❌ ดึงวิชาที่ลงทะเบียนล้มเหลว", error: err.message });
  }
};
