const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Class = require("../models/Class");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

function cleanName(raw) {
  return raw
    .replace(/ผู้สอน/g, '')
    .replace(/อาจารย์/g, '')
    .replace(/ดร\./g, '')
    .replace(/ดร/g, '')
    .replace(/ศ\./g, '')
    .trim();
}

function removeSectionFromCourseName(name) {
  return name.replace(/ตอน\s*\d+/g, '').trim();
}

// ✅ สร้างคลาสจากไฟล์ Excel
exports.createClass = [
  upload.single("file"),
  async (req, res) => {
    try {
      const { email, section } = req.body;
      const file = req.file;

      if (!file || !email) {
        return res.status(400).json({ message: "❌ กรุณาแนบไฟล์และอีเมลอาจารย์" });
      }

      const { classDoc, newTeacherCreated } = await createClassFromXlsx(file.buffer, email, section || "1");

      const message = newTeacherCreated
        ? `✅ สร้างคลาสและเพิ่มอาจารย์ใหม่ (${email}) สำเร็จ`
        : `✅ สร้างคลาสสำเร็จ`;

      res.json({ message, classId: classDoc._id });
    } catch (err) {
      res.status(500).json({ message: err.message || "❌ เกิดข้อผิดพลาด" });
    }
  }
];

// ✅ Internal: อ่านข้อมูลจากไฟล์ Excel และสร้างคลาส
async function createClassFromXlsx(buffer, email, section) {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const courseRow = rows.find(r => r?.[0]?.toString().includes("วิชา"));
  const teacherRow = rows.find(r => r?.[5]?.toString().includes("ผู้สอน"));
  if (!courseRow || !teacherRow) throw new Error("❌ ไม่พบข้อมูลวิชา หรือ ผู้สอนในไฟล์");

  const courseParts = courseRow[0].split(/\s+/);
  const courseCode = courseParts[1];
  let courseName = courseParts.slice(2).join(" ");
  courseName = removeSectionFromCourseName(courseName); // 💥 ตัดคำว่า "ตอน 1" ออก

  const sectionStr = String(section || "1");
  const teacherName = cleanName(teacherRow[5]);

  let teacher = await User.findOne({ fullName: teacherName.trim(), role: "teacher" });
  let newTeacherCreated = false;

  if (!teacher) {
    const hashed = await bcrypt.hash("teacher123", 10);
    teacher = await User.create({
      username: email.trim(),
      fullName: teacherName.trim(),
      email: email.trim(),
      password_hash: hashed,
      role: "teacher"
    });
    newTeacherCreated = true;
  } else {
    if (teacher.email !== email.trim()) {
      teacher.email = email.trim();
      teacher.username = email.trim();
      await teacher.save();
    }
  }

  const students = [];
  const seen = new Set();
  for (let i = 9; i < rows.length; i++) {
    const row = rows[i];
    const studentId = String(row[1] || "").trim();
    const fullName = String(row[2] || "").trim();
    if (!studentId || !fullName || seen.has(studentId)) continue;
    seen.add(studentId);

    const studentEmail = `s${studentId}@kmutnb.ac.th`;
    let user = await User.findOne({ studentId });

    if (!user) {
      const hashed = await bcrypt.hash(studentId, 10);
      user = await User.create({
        studentId,
        username: studentId,
        fullName,
        email: studentEmail,
        password_hash: hashed,
        role: "student"
      });
    } else {
      if (user.fullName !== fullName) {
        user.fullName = fullName;
        await user.save();
      }
    }

    students.push(user._id);
  }

  if (students.length === 0) throw new Error("❌ ไม่พบนักศึกษาในไฟล์");

  let classDoc = await Class.findOne({ courseCode, section: sectionStr });
  if (classDoc) {
    classDoc.courseName = courseName;
    classDoc.teacherId = teacher._id;
    classDoc.students = students;
    await classDoc.save();
  } else {
    classDoc = await Class.create({
      courseCode,
      courseName,
      section: sectionStr,
      teacherId: teacher._id,
      students
    });
  }

  return { classDoc, newTeacherCreated };
}

// ✅ GET /classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("teacherId", "fullName email")
      .populate("students", "fullName email username");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "❌ ดึงข้อมูลคลาสล้มเหลว", error: err.message });
  }
};

// ✅ GET /classes/:id
exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate("teacherId", "fullName email")
      .populate("students", "fullName studentId email");

    if (!cls) return res.status(404).json({ message: "❌ ไม่พบคลาสนี้" });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: "❌ โหลดคลาสล้มเหลว", error: err.message });
  }
};

// ✅ DELETE /classes/:id
exports.deleteClass = async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "❌ ไม่พบคลาส" });
    res.json({ message: "✅ ลบคลาสแล้ว" });
  } catch (err) {
    res.status(500).json({ message: "❌ ลบคลาสล้มเหลว", error: err.message });
  }
};

// ✅ GET /classes/student/:id
exports.getClassesByStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const classes = await Class.find({ students: studentId })
      .populate("teacherId", "fullName")
      .populate("students", "fullName email username")
      .select("courseCode courseName section");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "❌ โหลดคลาสของนักศึกษาล้มเหลว", error: err.message });
  }
};

// ✅ GET /classes/teacher
exports.getClassesByTeacher = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user._id });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "❌ โหลดคลาสของอาจารย์ล้มเหลว", error: err.message });
  }
};
