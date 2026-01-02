const express = require("express");
const authControllers = require("../controller/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", authControllers.registerUser);
router.post("/login", authControllers.loginUser);
router.get("/me", authMiddleware.authUser, authControllers.getCurrentUser);
router.post("/logout", authMiddleware.authUser, authControllers.logoutUser);

module.exports = router;
