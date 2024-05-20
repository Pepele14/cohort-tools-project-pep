const express = require("express");
const User = require("../models/user");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/:id - Protected Route
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user" });
  }
});

module.exports = router;
