import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!password || !confirmPassword) {
      alert("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    navigate("/AdminDashboard");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side */}
      <div
        className="flex-[6] p-16 flex flex-col items-center justify-center text-white"
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
        className="flex-[4] p-12 flex items-center justify-center"
        style={{ backgroundColor: "#F4F8FC" }}
      >
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("/ForgotPassword")}
            className="text-2xl text-gray-600 hover:text-indigo-700 font-medium mb-5"
          >
            &larr; Back
          </button>
          <h2 className="text-5xl font-semibold text-[#0D6EFD] mb-10">
            Create new password
          </h2>
          <p className="text-2xl text-gray-500 mb-6">
            Enter a new password and try not to forget it.
          </p>

          {/* Password Inputs with toggle */}
          <div className="flex flex-col gap-6">
            {/* New Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 px-4 text-xl border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-2xl"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-14 px-4 text-xl border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-2xl"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full mt-10 bg-indigo-800 hover:bg-indigo-900 text-white font-medium py-3 rounded-md transition duration-200 shadow-md hover:shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
