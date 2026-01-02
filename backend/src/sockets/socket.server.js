const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    console.log("socket connection cookie :", cookies.token);

    if (!cookies.token) {
      next(new Error("Authentication error : no token provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.id);

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Authentication error : no token provided"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      const [message, vectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: messagePayload.content,
          role: "user",
        }),
        aiService.generateVector(messagePayload.content),
      ]);
      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryvector: vectors,
          limit: 8,
          metadata: {
            user: socket.user._id,
          },
        }),
        messageModel
          .find({
            chat: messagePayload.chat,
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

      const response = await aiService.generateResponse([...ltm, ...stm]);

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });

      const responseMessage = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      try {
        const responseVectors = await aiService.generateVector(response);

        await createMemory({
          vectors: responseVectors,
          messageId: responseMessage._id,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: response,
          },
        });
      } catch (vectorError) {
        console.error("Vector generation failed:", vectorError);
      }

      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });
    });
  });
}

module.exports = initSocketServer;
