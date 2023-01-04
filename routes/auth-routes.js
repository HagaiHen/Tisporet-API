const express = require("express");
const { authenticate, signUp } = require("../controllers/authController");

const router = express.Router();

router.post("/auth", authenticate);
router.post("/signup", signUp);

module.exports = {
  routes: router,
};
