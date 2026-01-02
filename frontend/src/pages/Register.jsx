import { useState } from "react";
import axios from "axios";
import Toast from "../components/Toast";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        email: form.email,
        password: form.password,
        fullName: {
          firstName: form.firstName,
          lastName: form.lastName,
        },
      };

      await axios.post(
        "http://https://panchi-ai-chatsystem-project.onrender.com/api/auth/register",
        payload,
        {
          withCredentials: true,
        }
      );

      setToast({ type: "success", message: "Registered successfully 🎉" });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Registration failed",
      });
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHw1rbgM0f5ws8m5sA_vG2IZIKkAAxewsa1y9rI0u_GBUZXTN0IHwSRmK56auLtVWf_SswIbDLjXKP3hUKuqkugbemrRYJIatOur8gwI9m2rI1PKxAD8vYVeTvt9tTjdQts2aZE_UQ4aCvcQTlvtLB5SEWFoJ0KaNCTf7pj9sYw5Pdw5h9dryY7UFBBmNaEy6W6gg1tAOaS3Z9aIZCxSEU15M1QG5NTY6XI22KCo128WjYbIO1mr1ahGApHvCoaJ4CATD5W4a6IvqB"
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
      <div className="flex flex-1 items-center justify-center px-6 py-10 gap-6 flex-col bg-linear-to-br from-[#0f1f16] via-[#0b1a12] to-black">
        {toast && <Toast {...toast} />}

        <h1 className="sm:text-6xl text-5xl text-white font-extrabold tracking-tight text-center">
          Create an account
        </h1>
        <h2 className="">to unlock the power of Panchi AI</h2>

        <form
          onSubmit={handleRegister}
          className="w-full max-w-md rounded-2xl p-8 space-y-5
bg-black/60 backdrop-blur-xl
border border-white/10
shadow-[0_0_40px_rgba(34,197,94,0.15)]"
        >
          <div className="flex gap-3 flex-col">
            <label className="text-sm text-neutral-400">Name</label>
            <input
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              required
              className="input"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <label className="text-sm text-neutral-400 ">Email</label>
          <input
            name="email"
            type="email"
            placeholder="name@example.com"
            onChange={handleChange}
            required
            className="input mt-2"
          />

          <label className="text-sm text-neutral-400">Password</label>
          <input
            name="password"
            type="password"
            placeholder="********"
            onChange={handleChange}
            required
            className="input mt-2"
          />

          <button className="btn-primary">Register</button>

          <p className="text-sm text-neutral-400 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-green-500 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
