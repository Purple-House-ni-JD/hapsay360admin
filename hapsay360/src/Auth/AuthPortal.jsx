import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthPortal() {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;
  
  const navigate = useNavigate();

  async function login(payload) {
    try {
      const response = await fetch(`${apiBaseUrl}auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/AdminDashboard");
      } else {
        alert(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    }
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    await login({
      email: formData.email.trim(),
      password: formData.password,
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
            src="/images/icon.png"
            alt="HAPSAY360 Logo"
            className="w-80 h-80"
          />
        </div>
        <h1 className="text-7xl font-semibold tracking-wide drop-shadow-lg">
          HAPSAY<span className="text-6xl">360</span>
        </h1>
        <p className="text-xl mt-4 text-gray-300">Admin Portal</p>
      </div>

      {/* Right Side */}
      <div
        className="flex-[4] p-12 flex items-center justify-center shadow-lg"
        style={{ backgroundColor: "#F4F8FC" }}
      >
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Admin Sign In
          </h2>

          <div className="flex flex-col gap-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                    placeholder="Enter admin email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/ForgotPassword")}
                    className="text-sm text-[#0D6EFD] hover:text-indigo-700"
                  >
                    Forgot password?
                  </button>
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
                    placeholder="Enter admin password"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-indigo-800 hover:bg-indigo-900 text-white font-medium py-3 rounded-md transition duration-200 shadow-md hover:shadow-lg mt-2"
              >
                Sign in
              </button>

              {/* Admin Access Note */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 text-center">
                  <strong>Restricted Access:</strong> This portal is for authorized administrators only.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}