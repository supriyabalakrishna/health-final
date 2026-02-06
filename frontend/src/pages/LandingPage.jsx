import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHeartbeat } from "react-icons/fa";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-hs-green via-hs-blue to-hs-soft-pink"
    >
      <div className="text-center max-w-xl bg-white bg-opacity-60 p-12 rounded-3xl shadow-xl">
        <FaHeartbeat size={54} className="mx-auto mb-6 text-hs-soft-pink animate-pulse" />
        <h1 className="text-5xl font-extrabold mb-4 font-poppins text-hs-soft-pink">HealthSync</h1>
        <p className="text-xl mb-8 text-gray-700">
          Your Wellness Hub: Track Vitals, Plan Meals, Remember Meds, Emergency Support and More.
        </p>
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 font-bold text-lg rounded-xl bg-hs-green hover:bg-hs-soft-pink text-gray-900 shadow-lg transition duration-300"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 font-bold text-lg rounded-xl bg-hs-soft-pink hover:bg-hs-green text-gray-900 shadow-lg transition duration-300"
          >
            Login
          </button>
        </div>
      </div>
      <div className="absolute bottom-8 text-gray-500 font-inter text-sm opacity-80">
        &copy; {new Date().getFullYear()} HealthSync. Designed for next-generation wellness.
      </div>
    </motion.div>
  );
}