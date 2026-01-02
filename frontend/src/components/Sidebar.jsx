const Sidebar = ({
  chats,
  activeChat,
  setActiveChat,
  createNewChat,
  renameChat,
  deleteChat,
  user,
  onLogout,
}) => {
  return (
    <aside className="w-64 h-full bg-neutral-950 border-r border-neutral-800 flex flex-col">
      {/* New Chat */}
      <button
        onClick={createNewChat}
        className="m-3 rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800 shrink-0"
      >
        + New Chat
      </button>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 min-h-0">
        {chats.map((chat) => {
          const isActive = activeChat?._id === chat._id;
          return (
            <div
              key={chat._id}
              className={`group flex items-center justify-between px-2 py-1 rounded-lg mb-1 ${
                isActive ? "bg-neutral-800" : "hover:bg-neutral-800"
              }`}
            >
              <button
                onClick={() => setActiveChat(chat)}
                className="flex-1 text-left text-sm truncate"
              >
                {chat.title}
              </button>
              <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => renameChat(chat)}
                  className="text-xs px-1 py-0.5 rounded hover:bg-neutral-700"
                >
                  Rename
                </button>
                <button
                  onClick={() => deleteChat(chat)}
                  className="text-xs px-1 py-0.5 rounded text-red-400 hover:bg-red-900/40"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* User info / logout fixed at bottom */}
      {user && (
        <div className="border-t border-neutral-800 p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-semibold">
              {(
                user.fullName?.firstName?.[0] ||
                user.fullName?.lastName?.[0] ||
                user.email?.[0] ||
                "U"
              ).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {user.fullName?.firstName} {user.fullName?.lastName}
              </span>
              <span className="text-xs text-neutral-400 truncate">
                {user.email}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-red-400 hover:text-red-300 whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
