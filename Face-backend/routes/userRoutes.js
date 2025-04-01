const express = require("express");
const router = express.Router();
const { getTeachers, searchUsers } = require("../controllers/userController");

router.get("/teachers", getTeachers);
router.get("/search/users", searchUsers);

module.exports = router;
