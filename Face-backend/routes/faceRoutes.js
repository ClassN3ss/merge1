const express = require("express");
const router = express.Router();
const { findStudentByFace } = require("../controllers/faceController");

router.post("/find-student", findStudentByFace);

module.exports = router;
