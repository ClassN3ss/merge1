const Attendance = require("../models/Attendance");
const FaceScanLog = require("../models/FaceScanLog");

exports.checkIn = async (req, res) => {
  try {
    const { studentId, fullName, latitude, longitude, method, classId  } = req.body;

    if (!studentId || !latitude || !longitude) {
      return res.status(400).json({ message: "Missing check-in data" });
    }

    // Optional: เช็คเวลาว่า "late" หรือเปล่า
    const now = new Date();
    const hour = now.getHours();
    const status = hour >= 9 ? "Late" : "Present"; // ตัวอย่าง: เข้างานก่อน 9 โมง

    const newCheckIn = new Attendance({
      studentId,
      fullName,
      status,
      location_data: { latitude, longitude },
      scan_time: now,
    });

    await newCheckIn.save();

    if (classId) {
      const scanLog = new FaceScanLog({
        userId: studentId,
        classId,
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 8),
        location: { lat: latitude, lng: longitude },
        status: "success",
      });
      await scanLog.save();
    }
    
    res.json({ message: "✅ เช็คชื่อสำเร็จ", status });
  } catch (err) {
    res.status(500).json({ message: "❌ เช็คชื่อไม่สำเร็จ", error: err.message });
  }
};

exports.getHistoryByStudent = async (req, res) => {
    try {
      const { studentId } = req.params;
  
      const history = await Attendance.find({ studentId }).sort({ scan_time: -1 });
  
      res.json({ history });
    } catch (err) {
      res.status(500).json({ message: "ไม่สามารถดึงข้อมูลประวัติได้", error: err.message });
    }
};

exports.getAllFaceScanLogs = async (req, res) => {
  try {
    const logs = await FaceScanLog.find()
      .populate("userId", "fullName username")
      .populate("classId", "courseName courseCode");
    res.json(logs);
  } catch (err) {
    console.error("❌ ดึงประวัติการสแกนล้มเหลว:", err);
    res.status(500).json({ message: "❌ ไม่สามารถโหลดข้อมูลได้" });
  }
};
  
