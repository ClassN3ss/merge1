const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../configuration/config");

exports.register = async (req, res) => {
  try {
    const { studentId, fullName } = req.body;

    const existing = await User.findOne({ studentId, fullName });
    if (!existing) {
      return res.status(400).json({ message: "Student ID หรือชื่อไม่ตรงกับระบบ" });
    }

    const username = studentId;
    const password_hash = await bcrypt.hash(studentId, 10);

    existing.username = username;
    existing.password_hash = password_hash;
    await existing.save();

    res.json({ username, password: studentId });
  } catch (err) {
    res.status(500).json({ message: "❌ เกิดข้อผิดพลาด", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      $or: [
        { username },
        { studentId: username }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or student ID" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

exports.uploadFace = async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    const payload = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.faceScanned = true;
    user.faceDescriptor = faceDescriptor;
    await user.save();

    res.json({ message: "Face saved successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Face upload failed", error: err.message });
  }
};
