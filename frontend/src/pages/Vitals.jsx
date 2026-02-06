import React, { useState, useEffect } from "react";
import api from "../api/axios";

function getSuggestion(bsb, bsa, sys, dia) {
  let sug = [];
  if (bsb) {
    if (bsb < 50) sug.push("Blood sugar before food is LOW. Please eat something and retest.");
    else if (bsb > 120) sug.push("Blood sugar before food is HIGH. Consider seeing your doctor.");
  }
  if (bsa) {
    if (bsa < 70) sug.push("Blood sugar after food is LOW. Watch for symptoms and eat a snack.");
    else if (bsa > 180) sug.push("Blood sugar after food is HIGH. Consider adjusting diet.");
  }
  if (sys && sys > 140) sug.push("High blood pressure. Please consult your doctor.");
  if (sys && sys < 90) sug.push("Low blood pressure. Keep hydrated and rest.");
  return sug;
}

function getStatus(value, {low, high}) {
  if (value === "") return "";
  if (value < low) return "low";
  if (value > high) return "high";
  return "normal";
}
const styleByStatus = {
  high: "bg-red-100 text-red-800 border-red-300",
  low: "bg-blue-100 text-blue-800 border-blue-300",
  normal: "bg-green-100 text-green-800 border-green-300"
};

export default function Vitals() {
  const user = JSON.parse(localStorage.getItem("healthsync_user") || '{}');
  const [form, setForm] = useState({
    bloodSugarBefore: "", bloodSugarAfter: "",
    systolic: "", diastolic: "", mood: "", symptoms: ""
  });
  const [vitalsHistory, setVitalsHistory] = useState([]);

  useEffect(() => {
    api.get(`/vitals/${user.username}`).then(res => {
      setVitalsHistory(res.data.vitals || []);
    });
  }, [user.username]);
  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleSave(e) {
    e.preventDefault();
    api.post('/vitals', { username: user.username, vitals: form }).then(() => {
      setVitalsHistory(h => [...h, { ...form, time: new Date().toLocaleString() }]);
      setForm({
        bloodSugarBefore: "", bloodSugarAfter: "",
        systolic: "", diastolic: "", mood: "", symptoms: ""
      });
    });
  }

  const bsbStatus = getStatus(Number(form.bloodSugarBefore), { low: 50, high: 120 });
  const bsaStatus = getStatus(Number(form.bloodSugarAfter), { low: 70, high: 180 });

  const suggestions = getSuggestion(Number(form.bloodSugarBefore), Number(form.bloodSugarAfter), Number(form.systolic), Number(form.diastolic));

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="font-bold text-2xl mb-5">Record Vitals</h2>
      <form className="space-y-4 mb-10 bg-hs-blue p-6 rounded-2xl shadow-xl" onSubmit={handleSave}>
        <div className="mb-2">
          <label className="block font-semibold">Blood Sugar</label>
          <div className="flex gap-3">
            <input name="bloodSugarBefore" value={form.bloodSugarBefore} onChange={handleChange}
              className={`border rounded-lg p-2 w-32 ${styleByStatus[bsbStatus] || ""}`} placeholder="Before Food" />
            <input name="bloodSugarAfter" value={form.bloodSugarAfter} onChange={handleChange}
              className={`border rounded-lg p-2 w-32 ${styleByStatus[bsaStatus] || ""}`} placeholder="After Food" />
          </div>
          <div className="mt-1 text-xs">
            <span className="mr-2">Before food: <span className="font-bold">Normal (50-120)</span></span>
            <span>After food: <span className="font-bold">Normal (70-180)</span></span>
          </div>
        </div>
        <div className="mb-2">
          <label className="block font-semibold">Blood Pressure</label>
          <div className="flex gap-3">
            <input name="systolic" value={form.systolic} onChange={handleChange} className="border rounded-lg p-2 w-32" placeholder="Systolic (Top)" />
            <input name="diastolic" value={form.diastolic} onChange={handleChange} className="border rounded-lg p-2 w-32" placeholder="Diastolic (Bottom)" />
          </div>
          <div className="mt-1 text-xs">
            <span>Normal: <span className="font-bold">90/60 - 140/90</span></span>
          </div>
        </div>
        <div>
          <label className="block font-semibold">Mood & Symptoms</label>
          <input name="mood" value={form.mood} onChange={handleChange} className="border rounded-lg p-2 mr-3 w-40" placeholder="e.g. Good" />
          <input name="symptoms" value={form.symptoms} onChange={handleChange} className="border rounded-lg p-2 w-40" placeholder="(Optional)" />
        </div>
        <button type="submit" className="px-7 py-2 bg-hs-green rounded font-bold shadow-lg hover:scale-105">Save All Readings</button>
        {suggestions.length > 0 &&
          <div className="bg-hs-soft-pink text-red-700 rounded-md p-3 mt-3">
            <b>Suggestions:</b>
            <ul className="pl-5 list-disc text-sm">
              {suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        }
      </form>
      <h3 className="font-semibold text-lg mb-2">History</h3>
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        {vitalsHistory.length === 0 ? (
          <div className="text-gray-400">No vitals recorded yet.</div>
        ) : (
          vitalsHistory.slice(-6).reverse().map((v, idx) => (
            <div key={idx} className="border-b pb-2">
              <div className="font-semibold">{v.time}</div>
              <div>Blood Sugar: <span className={v.bloodSugarBefore > 120 ? "text-red-600 font-bold" : v.bloodSugarBefore < 50 ? "text-blue-600 font-bold" : "text-green-700"}>{v.bloodSugarBefore || '-'}</span> /
                <span className={v.bloodSugarAfter > 180 ? "text-red-600 font-bold" : v.bloodSugarAfter < 70 ? "text-blue-600 font-bold" : "text-green-700"}> {v.bloodSugarAfter || '-'}</span> mg/dL</div>
              <div>BP: <span>{v.systolic || '-'}/{v.diastolic || '-'}</span></div>
              <div>Mood/Symptoms: <b>{v.mood}</b> {v.symptoms && (<span>- {v.symptoms}</span>)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}