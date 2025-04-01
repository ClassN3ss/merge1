const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createClassFromXlsx, getAllClasses, deleteClass, getClassesByStudent } = require("../controllers/classController");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/create", upload.single("file"), async (req, res) => {
  try {
    const buffer = req.file?.buffer;
    if (!buffer) return res.status(400).json({ message: "❌ ไม่พบไฟล์" });

    const classDoc = await createClassFromXlsx(buffer, req.body.section);
    res.json({ message: "✅ สร้างหรืออัปเดตคลาสแล้ว", class: classDoc });
  } catch (err) {
    console.error("❌ CREATE ERROR:", err);
    res.status(500).json({ message: err.message || "❌ สร้างคลาสไม่สำเร็จ" });
  }
});

router.get("/student/:id", getClassesByStudent);
router.get("/", getAllClasses);
router.delete("/:id", deleteClass);

module.exports = router;
