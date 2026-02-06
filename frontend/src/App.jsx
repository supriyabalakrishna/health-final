import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Medications from "./pages/Medications";
import Vitals from "./pages/Vitals";
import MealPlanner from "./pages/MealPlanner";
import HealthHistory from "./pages/HealthHistory";
import Emergency from "./pages/Emergency";

export default function App() {
  const isLoggedIn = !!localStorage.getItem("healthsync_token");
  const location = useLocation();
  const routesWithSidebar = [
    "/dashboard",
    "/medications",
    "/vitals",
    "/mealplanner",
    "/healthhistory",
    "/emergency"
  ];
  const sidebarVisible = routesWithSidebar.some(r => location.pathname.startsWith(r));
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-hs-green to-hs-blue relative">
      {sidebarVisible && <Sidebar />}
      <main className={sidebarVisible ? "flex-1" : "w-full"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -120, opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Routes location={location}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />} />
              <Route path="/medications" element={isLoggedIn ? <Medications /> : <Navigate to="/login" replace />} />
              <Route path="/vitals" element={isLoggedIn ? <Vitals /> : <Navigate to="/login" replace />} />
              <Route path="/mealplanner" element={isLoggedIn ? <MealPlanner /> : <Navigate to="/login" replace />} />
              <Route path="/healthhistory" element={isLoggedIn ? <HealthHistory /> : <Navigate to="/login" replace />} />
              <Route path="/emergency" element={isLoggedIn ? <Emergency /> : <Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}