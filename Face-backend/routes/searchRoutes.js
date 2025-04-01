const express = require("express");
const router = express.Router();
const { searchUsers, searchClasses } = require("../controllers/searchController");

router.get("/users", searchUsers);
router.get("/classes", searchClasses);

module.exports = router;
