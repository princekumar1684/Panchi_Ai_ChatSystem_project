import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const API_BASE_URL = "http://https://panchi-ai-chatsystem-project.onrender.com";

const ChatHome = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          console.error("Failed to load user", error);
        }
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/chat`, {
          withCredentials: true,
        });
        const serverChats = res.data.chats || [];
        setChats(serverChats);
        if (!activeChat && serverChats.length > 0) {
          setActiveChat(serverChats[0]);
        }
      } catch (error) {
        console.error("Failed to load chats", error);
      }
    };

    fetchChats();
  }, [activeChat]);

  const createNewChat = async () => {
    const title = window.prompt("Enter a name for your new chat:");

    if (!title || !title.trim()) {
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/chat`,
        { title: title.trim() },
        { withCredentials: true }
      );

      const newChat = res.data.chat;
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Failed to create chat", error);
    }
  };

  const renameChat = async (chat) => {
    const newTitle = window.prompt("Rename chat:", chat.title);

    if (!newTitle || !newTitle.trim() || newTitle === chat.title) {
      return;
    }

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/chat/${chat._id}`,
        { title: newTitle.trim() },
        { withCredentials: true }
      );

      const updatedChat = res.data.chat;

      setChats((prev) =>
        prev.map((c) => (c._id === updatedChat._id ? updatedChat : c))
      );

      if (activeChat?._id === updatedChat._id) {
        setActiveChat(updatedChat);
      }
    } catch (error) {
      console.error("Failed to rename chat", error);
    }
  };

  const deleteChat = async (chat) => {
    const confirmed = window.confirm(
      `Delete chat "${chat.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/chat/${chat._id}`, {
        withCredentials: true,
      });

      setChats((prev) => prev.filter((c) => c._id !== chat._id));

      if (activeChat?._id === chat._id) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Failed to logout", error);
    } finally {
      setUser(null);
      setChats([]);
      setActiveChat(null);
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-neutral-950 border-b border-neutral-800">
        <button onClick={() => setIsSidebarOpen(true)} className="text-white">
          ☰
        </button>
        <h1 className="font-semibold text-sm">
          {activeChat?.title || "Panchi AI"}
        </h1>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-neutral-950 transform transition-transform duration-300 h-full flex flex-col
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar
          chats={chats}
          activeChat={activeChat}
          setActiveChat={(chat) => {
            setActiveChat(chat);
            setIsSidebarOpen(false);
          }}
          createNewChat={createNewChat}
          renameChat={renameChat}
          deleteChat={deleteChat}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Chat Window */}
      <div className="flex-1 pt-14 md:pt-0 h-full overflow-hidden">
        <ChatWindow activeChat={activeChat} />
      </div>
    </div>
  );
};

export default ChatHome;
