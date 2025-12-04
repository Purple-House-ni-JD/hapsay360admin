import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    if (val && index < 3) document.getElementById(`code-${index + 1}`).focus();
  };

  const handleResend = () => {
    setCode(["", "", "", ""]);
    setTimer(30);
    alert("Verification code resent!");
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
            onClick={() => navigate("/")}
            className="text-2xl text-gray-600 hover:text-indigo-700 font-medium mb-5"
          >
            &larr; Back
          </button>
          <h2 className="text-5xl font-semibold text-[#0D6EFD] mb-10">
            Forgot your password
          </h2>
          <p className="text-2xl text-gray-500 mb-6">
            Enter the verification code sent to your email sample@example.com
          </p>

          {/* Verification Code Inputs */}
          <div className="flex justify-between gap-4 mb-4">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                className="w-16 h-16 text-center text-xl border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            ))}
          </div>

          {/* Resend Timer */}
          <p className="text-2xl text-gray-500 mb-6">
            Didn't receive code?{" "}
            {timer <= 0 ? (
              <button
                onClick={handleResend}
                className="text-[#0D6EFD] hover:text-indigo-700 font-medium"
              >
                Resend
              </button>
            ) : (
              <span>00:{timer.toString().padStart(2, "0")}</span>
            )}
          </p>

          <button
            onClick={() => navigate("/CreateNewPassword")}
            className="w-full mt-10 bg-indigo-800 hover:bg-indigo-900 text-white font-medium py-3 rounded-md transition duration-200 shadow-md hover:shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
