import { useState } from "react";
import axios from "axios";
import Toast from "../components/Toast";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://panchi-ai-chatsystem-project.onrender.com/api/auth/login",
        form,
        {
          withCredentials: true,
        }
      );

      setToast({ type: "success", message: "Login successful ✅" });

      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Login failed",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-white">
      {toast && <Toast {...toast} />}

      {/* Left Image Section (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqztyuMFzSQCCrvJ4sJOBoRn38oq3PLlUmNIbWg-FL6rghIBKtfaoqBwQQaLgYZJhTdSC20z68BjvjicL8OuuI2s4yGIMqdZsr7NKJcFHWENQeRc8_aDOJ1q6VFI_q7I-p85T-cL82pHyneopGc-iJXAUXIRPqNR8eNtkxMQcHP-cXaNbfwZe5ptFsu1_asf1PqwPJv4hWN0FGuH0sweKROlrxeYQ0Ct9V15UWHNWBYOOuGWZ_yCEiWc42vqCJZQlPbov1SR1X2ZEN"
          alt="Panchi AI"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex items-center justify-center w-full flex-col">
          <h1 className="text-9xl font-bold tracking-tight">
            Panchi <span className="text-green-600">AI</span>
          </h1>
          <h4 className="text-2xl">Your Personal AI Assistant</h4>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-linear-to-br from-green-950 via-[#0f1f16] to-neutral-950 flex flex-1 items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md space-y-6 rounded-2xl bg-[#0f1f16]/80 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/5"
        >
          <div className="mb-6">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-green-200/70 text-sm tracking-wide">
              connect with your personal AI assistant
            </p>
          </div>

          <div className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
              className="w-full h-14 rounded-xl bg-[#153326]/80 border border-green-900 px-4 outline-none placeholder:text-green-200/40 focus:ring-2 focus:ring-green-500/40 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.15)] transition"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full h-14 rounded-xl bg-[#153326]/80 border border-green-900 px-4 outline-none placeholder:text-green-200/40 focus:ring-2 focus:ring-green-500/40 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.15)] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full h-14 rounded-xl bg-linear-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-600 font-semibold transition shadow-[0_10px_30px_rgba(34,197,94,0.35)] hover:shadow-[0_15px_40px_rgba(34,197,94,0.45)] active:scale-[0.98]"
          >
            Log In →
          </button>

          <p className="text-center text-sm text-neutral-400">
            Don’t have an account?{" "}
            <Link to="/register" className="text-green-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
