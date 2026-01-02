const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");
const aiService = require("../services/ai.service");
const { createMemory, queryMemory } = require("../services/vector.service");

async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  const chat = await chatModel.create({
    user: user._id,
    title,
  });

  res.status(201).json({
    message: "Chat created successfully",
    chat: {
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    },
  });
}

async function renameChat(req, res) {
  const user = req.user;
  const { chatId } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const chat = await chatModel.findOneAndUpdate(
    { _id: chatId, user: user._id },
    { title: title.trim() },
    { new: true }
  );

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  res.status(200).json({
    message: "Chat renamed successfully",
    chat: {
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    },
  });
}

async function deleteChat(req, res) {
  const user = req.user;
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: user._id,
  });

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // delete all messages for this chat
  await messageModel.deleteMany({ chat: chatId });

  res.status(200).json({
    message: "Chat deleted successfully",
  });
}

async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel
    .find({ user: user._id })
    .sort({ updatedAt: -1 })
    .lean();

  res.status(200).json({
    chats: chats.map((chat) => ({
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    })),
  });
}

async function getMessages(req, res) {
  const user = req.user;
  const { chatId } = req.params;

  const chat = await chatModel.findOne({ _id: chatId, user: user._id });

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const messages = await messageModel
    .find({ chat: chatId })
    .sort({ createdAt: 1 })
    .lean();

  res.status(200).json({
    messages,
  });
}

async function sendMessage(req, res) {
  const user = req.user;
  const { chatId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: "Content is required" });
  }

  const chat = await chatModel.findOne({ _id: chatId, user: user._id });

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const [userMessage, vectors] = await Promise.all([
    messageModel.create({
      chat: chatId,
      user: user._id,
      content,
      role: "user",
    }),
    aiService.generateVector(content),
  ]);

  await createMemory({
    vectors,
    messageId: userMessage._id,
    metadata: {
      chat: chatId,
      user: user._id,
      text: content,
    },
  });

  const [memory, chatHistory] = await Promise.all([
    queryMemory({
      queryvector: vectors,
      limit: 8,
      metadata: {
        user: user._id,
      },
    }),
    messageModel
      .find({
        chat: chatId,
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  const stm = chatHistory
    .slice()
    .reverse()
    .map((item) => {
      return {
        role: item.role,
        parts: [{ text: item.content }],
      };
    });

  const ltm = [
    {
      role: "user",
      parts: [
        {
          text: `You have access to some of this user's previous relevant messages (possibly from other chats).
Use them as background context AND as factual memory when helpful (for example, to recall names, preferences, or which framework was mentioned earlier).
Do NOT re-answer entire previous questions unless it is directly helpful; avoid repeating long earlier answers verbatim.
Always focus your reply on the latest user message in the conversation while staying consistent with their past context.

Here are condensed previous relevant messages (do not copy them word-for-word, just use them for context and factual recall):
${memory.map((item) => item.metadata.text).join("\n")}`,
        },
      ],
    },
  ];

  const responseText = await aiService.generateResponse([...ltm, ...stm]);

  const [aiMessage, responseVectors] = await Promise.all([
    messageModel.create({
      chat: chatId,
      user: user._id,
      content: responseText,
      role: "model",
    }),
    aiService.generateVector(responseText),
  ]);

  await createMemory({
    vectors: responseVectors,
    messageId: aiMessage._id,
    metadata: {
      chat: chatId,
      user: user._id,
      text: responseText,
    },
  });

  res.status(201).json({
    message: "Message sent successfully",
    userMessage,
    aiMessage,
  });
}

module.exports = {
  createChat,
  renameChat,
  deleteChat,
  getChats,
  getMessages,
  sendMessage,
};
