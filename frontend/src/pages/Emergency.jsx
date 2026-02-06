import React, { useState } from "react";
import api from "../api/axios";
import { FaPhone, FaUserPlus } from 'react-icons/fa';

export default function Emergency() {
  const user = JSON.parse(localStorage.getItem("healthsync_user") || '{}');
  const [caregiver, setCaregiver] = useState({ name: "", number: "" });
  const [msg, setMsg] = useState("");
  function handleSetCaregiver(e) {
    e.preventDefault();
    api.post('/caregiver', { username: user.username, caregiver }).then(() => {
      setMsg("Caregiver added!");
      setTimeout(() => setMsg(""), 1200);
    });
  }
  return (
    <div className="max-w-lg mx-auto bg-hs-card p-8 rounded-2xl shadow-lg mt-10">
      <h2 className="font-bold text-2xl mb-6 text-hs-soft-pink flex gap-2"><FaUserPlus /> Emergency Contact</h2>
      <form className="flex gap-4 mb-5" onSubmit={handleSetCaregiver}>
        <input value={caregiver.name} onChange={e => setCaregiver({...caregiver, name: e.target.value})} placeholder="Name"
          className="border p-2 rounded-xl w-1/2" required />
        <input value={caregiver.number} onChange={e => setCaregiver({...caregiver, number: e.target.value})} placeholder="Phone"
          className="border p-2 rounded-xl w-1/2" required pattern="^[0-9+()-]*$"/>
        <button type="submit" className="bg-hs-soft-pink px-7 py-2 rounded-xl font-bold shadow">Save</button>
      </form>
      {caregiver.number &&
        <div className="mt-4 flex gap-3 items-center">
          <span className="font-semibold">{caregiver.name}:</span>
          <a href={`tel:${caregiver.number}`} className="bg-hs-green px-4 py-2 rounded-xl font-bold flex gap-2 items-center text-gray-900 hover:opacity-90 shadow"><FaPhone />{caregiver.number}</a>
        </div>
      }
      {msg && <div className="text-green-600 mt-4">{msg}</div>}
    </div>
  );
}