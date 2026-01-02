import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Message from "./Message";

const API_BASE_URL = "https://panchi-ai-chatsystem-project.onrender.com";

const ChatWindow = ({ activeChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat?._id) {
        setMessages([]);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/chat/${activeChat._id}/messages`,
          {
            withCredentials: true,
          }
        );
        setMessages(res.data.messages || []);
      } catch (error) {
        console.error("Failed to load messages", error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [activeChat]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat?._id || isSending) return;

    const content = input.trim();

    const tempUserMessage = {
      _id: `temp-user-${Date.now()}`,
      role: "user",
      content,
    };

    const tempAiMessage = {
      _id: `temp-ai-${Date.now()}`,
      role: "model",
      content: "🐦 Panchi is thinking... please wait a moment.",
      isPlaceholder: true,
    };

    setMessages((prev) => [...prev, tempUserMessage, tempAiMessage]);
    setInput("");
    setIsSending(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/chat/${activeChat._id}/message`,
        { content },
        { withCredentials: true }
      );

      const { userMessage, aiMessage } = res.data;

      setMessages((prev) => [
        ...prev.filter(
          (msg) =>
            msg._id !== tempUserMessage._id && msg._id !== tempAiMessage._id
        ),
        userMessage,
        aiMessage,
      ]);
    } catch (error) {
      console.error("Failed to send message", error);
      // remove placeholders on error
      setMessages((prev) =>
        prev.filter(
          (msg) =>
            msg._id !== tempUserMessage._id && msg._id !== tempAiMessage._id
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="flex flex-col h-full bg-neutral-900 text-white overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-neutral-800 flex items-center px-4 font-semibold shrink-0">
        {activeChat?.title || "Panchi AI"}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="max-w-xl text-neutral-400">
              <h1 className="text-5xl font-semibold mb-4 text-white/80">
                Welcome to{" "}
                <i>
                  <span className="text-green-500 text-7xl">
                    {" "}
                    <br />
                    Panchi AI
                  </span>
                </i>{" "}
                🐦
              </h1>
              <p className="text-base">
                Your calm AI companion. Type a message below to begin ✨
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <Message
                key={msg._id || msg.id}
                role={msg.role}
                text={msg.content ?? msg.text}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-800 p-4 bg-neutral-900 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            rows={1}
            placeholder="Message Panchi..."
            className="flex-1 resize-none rounded-xl bg-neutral-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-600"
          />
          <button
            onClick={sendMessage}
            disabled={isSending}
            className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default ChatWindow;
