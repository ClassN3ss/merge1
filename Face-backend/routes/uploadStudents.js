const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadCSV } = require("../controllers/uploadStudentsController");

// 📂 บันทึกไฟล์ลง /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

router.post("/csv", upload.single("file"), uploadCSV);

module.exports = router;
