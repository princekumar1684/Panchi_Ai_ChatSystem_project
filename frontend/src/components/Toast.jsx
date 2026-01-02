const Toast = ({ message, type }) => {
  return (
    <div
      className={`fixed top-5 right-5 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {message}
    </div>
  );
};

export default Toast;