import React from 'react';
import { NavLink } from "react-router-dom";
import { FaHome, FaPills, FaHeartbeat, FaListAlt, FaLeaf, FaHistory, FaPhoneAlt } from "react-icons/fa";

const navItems = [
  { icon: <FaHome />, label: 'Dashboard', path: '/dashboard' },
  { icon: <FaPills />, label: 'Medications', path: '/medications' },
  { icon: <FaHeartbeat />, label: 'Vitals', path: '/vitals' },
  { icon: <FaLeaf />, label: 'Meal Planner', path: '/mealplanner' },
  { icon: <FaHistory />, label: 'Health History', path: '/healthhistory' },
  { icon: <FaPhoneAlt />, label: 'Emergency', path: '/emergency' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-hs-card h-screen p-6 flex flex-col gap-2 shadow-lg fixed md:relative z-10">
      <div className="font-extrabold text-2xl text-hs-soft-pink mb-8 tracking-wider">HealthSync</div>
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition ${
              isActive ? "bg-hs-green text-hs-soft-pink" : "text-gray-700 hover:bg-hs-blue"
            }`
          }
        >
          <span className="text-xl">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}