import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function HealthHistory() {
  const user = JSON.parse(localStorage.getItem("healthsync_user") || '{}');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get(`/history/${user.username}`).then(res => {
      setHistory(res.data.history || []);
    });
  }, [user.username]);

  // Prepare vitals data for graph
  const vitalsData = history
    .filter(h => h.bloodSugarBefore || h.systolic)
    .map((h, idx) => ({
      name: h.time || `Record ${idx + 1}`,
      bloodSugarBefore: Number(h.bloodSugarBefore) || null,
      bloodSugarAfter: Number(h.bloodSugarAfter) || null,
      systolic: Number(h.systolic) || null,
      diastolic: Number(h.diastolic) || null,
    }));

  function handleDownload() {
    const text = JSON.stringify(history, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "health_history.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl mx-auto mt-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-2xl">Health History & Insights</h2>
        <button onClick={handleDownload}
          className="bg-hs-soft-pink rounded px-5 py-2 font-medium shadow hover:scale-105">Download All</button>
      </div>
      <div className="mb-7">
        {vitalsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={vitalsData}>
              <Line type="monotone" dataKey="bloodSugarBefore" stroke="#e57373" name="Sugar Before" />
              <Line type="monotone" dataKey="bloodSugarAfter" stroke="#64b5f6" name="Sugar After" />
              <Line type="monotone" dataKey="systolic" stroke="#388e3c" name="Systolic" />
              <Tooltip />
              <Legend />
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid stroke="#ccc" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-400 mb-6">No vitals recorded to graph.</div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {history.length === 0
          ? <div className="col-span-2 text-gray-400">No history yet.</div>
          : history.slice(-12).reverse().map((rec, idx) => (
            <div key={idx} className="bg-hs-blue rounded-xl shadow-lg p-5 mb-2 min-h-[110px]">
              <div>
                <b>{rec.time ? new Date(rec.time).toLocaleString() : "—"}</b>
                {rec.name && <span className="ml-2">{rec.name}</span>}
              </div>
              {rec.bloodSugarBefore && <div className="mt-1 text-sm">Blood Sugar:
                <span className={rec.bloodSugarBefore > 120 ? "text-red-600 font-bold" :
                  rec.bloodSugarBefore < 50 ? "text-blue-600 font-bold" : "text-green-700 font-bold"}>
                  {rec.bloodSugarBefore}
                </span> /
                <span className={rec.bloodSugarAfter > 180 ? "text-red-600 font-bold" :
                  rec.bloodSugarAfter < 70 ? "text-blue-600 font-bold" : "text-green-700 font-bold"}>
                  {rec.bloodSugarAfter}
                </span> mg/dL
              </div>}
              {rec.systolic &&
                <div className="text-sm">BP: <span>{rec.systolic} / {rec.diastolic}</span></div>
              }
              {rec.mood && <div className="text-sm">Mood: <b>{rec.mood}</b></div>}
              {rec.symptoms && <div className="text-sm text-gray-600">Symptoms: {rec.symptoms}</div>}
              {rec.status && <span className={`px-2 py-1 rounded-xl text-xs ml-2 ${rec.status === "Taken" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>{rec.status}</span>}
            </div>
          ))}
      </div>
    </div>
  );
}