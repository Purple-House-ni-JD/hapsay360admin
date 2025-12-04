import React, { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthPortal() {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const initialFormState = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  };

  const navigate = useNavigate();

  const capitalizeString = (s = "") => {
    const str = String(s).trim();
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  async function login(payload) {
    const response = await fetch(`${apiBaseUrl}auth/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    console.log(data);
    if (response.ok) {
      localStorage.setItem("token", data.token);
      navigate("/AdminDashboard");
    } else {
      alert(data.message);
    }
  }

  async function signup(payload) {
    const response = await fetch(`${apiBaseUrl}auth/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    console.log(data);
    if (response.ok) {
      alert("Account created! You can now sign in.");
      setIsLogin(true);
      setFormData(initialFormState);
    } else {
      alert(data.message || "Unable to create account.");
    }
  }

  // async function forgotPassword() {
  //   const response = await fetch(`${baseUrl}auth/admin/forgot-password`, {
  //     method: "POST",
  //     body: JSON.stringify(formData),
  //   });
  //   const data = await response.json();
  //   console.log(data);
  // }

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLogin) {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      return;
    }

    await signup({
      first_name: capitalizeString(formData.first_name),
      last_name: capitalizeString(formData.last_name),
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setFormData(initialFormState);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side */}
      <div
        className="flex-[6] p-16 flex flex-col items-center justify-center text-white shadow-inner"
        style={{ backgroundColor: "#141545" }}
      >
        <div className="mb-8">
          <img
            src="/images/icon.png"
            alt="HAPSAY360 Logo"
            className="w-80 h-80"
          />
        </div>
        <h1 className="text-7xl font-semibold tracking-wide drop-shadow-lg">
          HAPSAY<span className="text-6xl">360</span>
        </h1>
      </div>

      {/* Right Side */}
      <div
        className="flex-[4] p-12 flex items-center justify-center shadow-lg"
        style={{ backgroundColor: "#F4F8FC" }}
      >
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            {isLogin ? "Sign in to your account" : "Sign Up"}
          </h2>

          <div className="flex flex-col gap-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* First & Last Name (Sign Up only) */}
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        required={!isLogin}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
                        placeholder="Enter your first name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        required={!isLogin}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    required
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className={`${isLogin ? "mt-6" : ""}`}>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => navigate("/ForgotPassword")}
                      className="text-sm text-[#0D6EFD] hover:text-indigo-700"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    required
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-indigo-800 hover:bg-indigo-900 text-white font-medium py-3 rounded-md transition duration-200 shadow-md hover:shadow-lg"
              >
                {isLogin ? "Sign in" : "Sign up"}
              </button>

              {/* Toggle */}
              <p className="text-xl text-gray-600 text-center pt-4">
                {isLogin ? "No account yet? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-[#0D6EFD] hover:text-indigo-700 font-medium"
                >
                  {isLogin ? "Create Now" : "Sign in"}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
