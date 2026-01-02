import ReactMarkdown from "react-markdown";

const Message = ({ role, text }) => {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div
        className={`max-w-[85%] md:max-w-2xl rounded-2xl px-4 py-2 text-sm ${
          isUser ? "bg-green-600 text-white" : "bg-neutral-800 text-neutral-100"
        }`}
        style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
      >
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => (
              <p
                className="mb-1 last:mb-0"
                style={{ wordBreak: "break-word" }}
                {...props}
              />
            ),
            ul: ({ node, ...props }) => (
              <ul
                className="list-disc list-inside space-y-1"
                style={{ wordBreak: "break-word" }}
                {...props}
              />
            ),
            ol: ({ node, ...props }) => (
              <ol
                className="list-decimal list-inside space-y-1"
                style={{ wordBreak: "break-word" }}
                {...props}
              />
            ),
            code: ({ node, inline, ...props }) => {
              return inline ? (
                <code
                  className="bg-neutral-700/50 px-1 py-0.5 rounded text-xs"
                  style={{ wordBreak: "break-all" }}
                  {...props}
                />
              ) : (
                <code
                  className="block bg-neutral-700/50 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap"
                  style={{ wordBreak: "break-word" }}
                  {...props}
                />
              );
            },
            pre: ({ node, ...props }) => (
              <pre
                className="bg-neutral-700/50 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap my-2"
                style={{ wordBreak: "break-word" }}
                {...props}
              />
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Message;
