const express = require("express");
const router = express.Router();
const { getAllFaceScanLogs } = require("../controllers/faceScanLogController");

router.get("/history1", getAllFaceScanLogs);

module.exports = router;
