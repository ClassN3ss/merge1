const express = require("express");
const router = express.Router();
const { createRequest, getAllRequests, approveRequest, deleteRequest, } = require("../controllers/enrollController");

router.post("/", createRequest);
router.get("/requests", getAllRequests);
router.put("/approve/:id", approveRequest);
router.delete("/:id", deleteRequest);

module.exports = router;
