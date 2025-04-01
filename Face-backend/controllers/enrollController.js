const Enroll = require("../models/Enroll");
const Class = require("../models/Class");

exports.createRequest = async (req, res) => {
  try {
    const { student, classId, reason } = req.body;
    const request = new Enroll({ student, classId, reason });
    await request.save();
    res.status(201).json({ message: "📨 ส่งคำขอเข้าร่วมคลาสสำเร็จ", request });
  } catch (error) {
    res.status(500).json({ message: "❌ ไม่สามารถส่งคำขอได้", error: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Enroll.find()
      .populate("student", "fullName studentId")
      .populate("classId", "courseName section");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "❌ โหลดคำขอไม่สำเร็จ", error: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const request = await Enroll.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "❌ ไม่พบคำขอ" });

    request.approved = true;
    await request.save();

    await Class.findByIdAndUpdate(request.classId, {
      $addToSet: { students: request.student },
    });

    res.json({ message: "✅ อนุมัติเข้าคลาสแล้ว", request });
  } catch (error) {
    res.status(500).json({ message: "❌ ไม่สามารถอนุมัติได้", error: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await Enroll.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑 ลบคำขอแล้ว" });
  } catch (error) {
    res.status(500).json({ message: "❌ ลบคำขอไม่สำเร็จ", error: error.message });
  }
};
