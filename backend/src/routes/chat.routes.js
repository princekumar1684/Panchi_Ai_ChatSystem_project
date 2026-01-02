const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
const chatController = require("../controller/chat.controller");

router.post("/", authMiddleware.authUser, chatController.createChat);
router.get("/", authMiddleware.authUser, chatController.getChats);
router.patch("/:chatId", authMiddleware.authUser, chatController.renameChat);
router.delete("/:chatId", authMiddleware.authUser, chatController.deleteChat);
router.get(
  "/:chatId/messages",
  authMiddleware.authUser,
  chatController.getMessages
);
router.post(
  "/:chatId/message",
  authMiddleware.authUser,
  chatController.sendMessage
);

module.exports = router;
