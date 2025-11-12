import React, { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert(`${isLogin ? "Login" : "Signup"} successful!`);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
            src="../images/icon.png"
            alt="HAPSAY360 Logo"
            className="w-100 h-80"
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
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Email (only for Sign Up) */}
            {!isLogin && (
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
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className={`${isLogin ? "mt-6" : ""}`}>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {isLogin && (
                  <button
                    onClick={() => navigate("/ForgotPassword")}
                    className="text-1xl text-[#0D6EFD] hover:text-indigo-700 font-sm"
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
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-800 hover:bg-indigo-900 text-white font-medium py-3 rounded-md transition duration-200 shadow-md hover:shadow-lg"
            >
              {isLogin ? "Sign in" : "Sign up"}
            </button>

            {/* Toggle */}
            <p className="text-1xl text-gray-600 text-center pt-4">
              {isLogin ? "No account yet? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#0D6EFD] hover:text-indigo-700 font-medium"
              >
                {isLogin ? "Create Now" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
