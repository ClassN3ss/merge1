const User = require("../models/User");
const Enroll = require("../models/Enroll");
const Class = require("../models/Class");

// ✅ GET /users - โหลดผู้ใช้ทั้งหมด พร้อมข้อมูลคลาส (student/teacher)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password -password_hash');

    const withClassData = await Promise.all(users.map(async (u) => {
      let classCount = 0;
      let classNames = [];

      if (u.role === 'student') {
        const enrolls = await Enroll.find({ student: u._id }).populate('classId', 'courseName');
        classCount = enrolls.length;
        classNames = enrolls.map(e => e.class?.subjectName || 'ไม่ระบุชื่อวิชา');
      } else if (u.role === 'teacher') {
        const classes = await Class.find({ teacher: u._id }).select('courseName');
        classCount = classes.length;
        classNames = classes.map(c => c.subjectName);
      }

      return {
        ...u.toObject(),
        classCount,
        classNames,
      };
    }));

    res.json(withClassData);
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถโหลดผู้ใช้ได้', error: err.message });
  }
};

// ✅ GET /teachers - ดึงรายการอาจารย์ทั้งหมด
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('fullName _id email username');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "❌ โหลดรายชื่ออาจารย์ล้มเหลว", error: err.message });
  }
};

// ✅ GET /search/users?q=&role= - ค้นหาผู้ใช้
exports.searchUsers = async (req, res) => {
  try {
    const { q = '', role } = req.query;
    if (!q.trim()) return res.json([]);

    const keyword = new RegExp(q.trim(), 'i');
    const filter = {
      $or: [
        { fullName: keyword },
        { username: keyword },
        { email: keyword }
      ]
    };
    if (role) filter.role = role;

    const users = await User.find(filter)
      .limit(10)
      .select('username fullName role email');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "❌ ค้นหาผู้ใช้ล้มเหลว", error: err.message });
  }
};

// ✅ PUT /users/:id - อัปเดตข้อมูลผู้ใช้
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้', error: err.message });
  }
};

// ✅ DELETE /users/:id - ลบผู้ใช้
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    res.json({ message: '✅ ลบผู้ใช้แล้ว' });
  } catch (err) {
    res.status(500).json({ message: '❌ ลบผู้ใช้ล้มเหลว', error: err.message });
  }
};
