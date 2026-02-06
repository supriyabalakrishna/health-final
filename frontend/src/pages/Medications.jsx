import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaPills, FaEnvelope } from 'react-icons/fa';
import api from '../api/axios';

export default function Medications() {
  const user = JSON.parse(localStorage.getItem("healthsync_user") || '{}');
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ name: '', time: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/medicines/${user.username}`).then(res => {
      setMedicines(res.data.medicines || []);
    });
  }, [user.username]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleAddMedicine(e) {
    e.preventDefault();
    api.post('/medicines', { username: user.username, medicine: { ...form } })
      .then(() => {
        setMedicines(meds => [...meds, { ...form, status: "Pending" }]);
        setForm({ name: '', time: '' });
        setMsg('Medicine added!');
        setTimeout(() => setMsg(''), 1200);
      });
  }

  function updateMedicineStatus(idx, status) {
    api.post('/medicines/update', { username: user.username, index: idx, status })
      .then(() => {
        setMedicines(meds => meds.map((med, i) => i === idx ? { ...med, status } : med));
        setMsg(status === "Taken" ? "Marked as taken!" : "Marked as missed.");
        setTimeout(() => setMsg(''), 1000);
        // Send reminder mock
        if (status === "Missed") api.post('/reminder/email', { username: user.username, medicine: medicines[idx].name });
      });
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="font-bold text-2xl mb-4 flex items-center gap-2"><FaPills /> Medicine Reminders</h2>
      <form className="flex gap-3 mb-6 bg-hs-blue p-5 rounded-xl shadow-lg" onSubmit={handleAddMedicine}>
        <input name="name" value={form.name} onChange={handleChange}
          placeholder="Medicine Name" className="border border-hs-soft-pink p-2 rounded-xl" required />
        <input name="time" value={form.time} onChange={handleChange}
          placeholder="Time (e.g. 2:00 PM)" className="border border-hs-soft-pink p-2 rounded-xl" required />
        <button type="submit" className="bg-hs-soft-pink px-6 py-2 rounded-xl font-bold text-gray-800 hover:opacity-80 shadow">Add</button>
      </form>
      {msg && <div className="text-center text-green-600 mb-3">{msg}</div>}
      <div className="space-y-4">
        {medicines.length === 0 ? (
          <div className="text-gray-400">No medicines yet.</div>
        ) : (
          medicines.map((med, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">{med.name}</div>
                <div className="text-gray-600 text-sm">{med.time}</div>
              </div>
              <div className="flex gap-2 items-center">
                <span className={`px-3 py-1 rounded-lg font-bold text-xs ${med.status === "Taken" ? "bg-green-100 text-green-700" : med.status === "Missed" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-800"}`}>
                  {med.status}
                </span>
                <button onClick={() => updateMedicineStatus(idx, "Taken")} title="Mark as taken">
                  <FaCheckCircle size={28} className="text-green-400 hover:scale-110 transition" />
                </button>
                <button onClick={() => updateMedicineStatus(idx, "Missed")} title="Mark as missed">
                  <FaTimesCircle size={28} className="text-red-400 hover:scale-110 transition" />
                </button>
                <button onClick={() => api.post('/reminder/email', { username: user.username, medicine: med.name })} title="Send Reminder">
                  <FaEnvelope size={20} className="text-blue-400 hover:scale-125 transition" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}