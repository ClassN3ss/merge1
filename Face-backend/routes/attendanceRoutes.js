const express = require("express");
const router = express.Router();
const { checkIn, getHistoryByStudent, getAllFaceScanLogs } = require("../controllers/attendanceController");


router.post("/checkin", checkIn);
router.get("/history/:studentId", getHistoryByStudent);

router.get("/history-student", getAllFaceScanLogs);

module.exports = router;
