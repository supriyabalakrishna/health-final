import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { FaWater, FaHeartbeat, FaPills, FaQuoteLeft, FaSmileBeam } from 'react-icons/fa';

const quotes = [
  "Take care of your body. It’s the only place you have to live.",
  "Your wellness is an investment, not an expense.",
  "Every day is a new beginning. Embrace it with a healthy mind and body.",
  "Eat smart, move more, sleep well, stay positive.",
  "Health is the true wealth.",
  "Keep pushing. Your health journey is worth it.",
  "Small healthy steps every day lead to big changes.",
  "Your only limit is you.",
];

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('healthsync_user') || '{}');
  const [water, setWater] = useState(0);
  const [meds, setMeds] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [quote, setQuote] = useState("");
  const [animate, setAnimate] = useState(0);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    function updateAll() {
      api.get(`/medicines/${user.username}`).then(res => setMeds(res.data.medicines || []));
      api.get(`/vitals/${user.username}`).then(res => setVitals(res.data.vitals || []));
    }
    updateAll();
    const interval = setInterval(() => {updateAll(); setAnimate(a=>a+1);}, 4000);
    return () => clearInterval(interval);
  }, [user.username]);

  function handleWaterChange(e) {
    setWater(Number(e.target.value));
  }

  const latest = vitals.length > 0 ? vitals[vitals.length - 1] : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      key={animate}
      className="w-full flex flex-col items-center"
    >
      <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
        <motion.div whileHover={{ scale: 1.03, boxShadow: '0 8px 32px #ffd3b6' }} className="w-full">
          <Card className="w-full min-h-[230px] flex flex-col justify-center items-start animate-float-1">
            <div className="flex items-center gap-3 mb-2">
              <FaSmileBeam className="text-3xl text-hs-soft-pink" />
              <h2 className="font-bold text-2xl">Good afternoon, {user.name || 'User'}</h2>
            </div>
            <div className="italic mb-3 text-hs-soft-pink flex gap-1"><FaQuoteLeft /> {quote}</div>
            <div className="mt-2 flex flex-col gap-3">
              <div>
                <FaWater className="text-hs-green mr-3 inline" />
                <span className="font-bold text-hs-soft-pink">Water Intake:</span>
                <input type="number" value={water} min={0} max={8} step={0.1}
                  onChange={handleWaterChange}
                  className="border p-1 rounded-lg font-bold w-20 mx-1"
                /> <span className="text-sm text-gray-600">litres</span>
              </div>
              <div><FaHeartbeat className="text-hs-blue mr-2 inline" />
                <span className="font-bold text-hs-soft-pink">Recent Vitals: </span>
                <span>
                  BS: <b>{latest.bloodSugarBefore ?? "—"}</b> /
                  <b>{latest.bloodSugarAfter ?? "—"}</b> mg/dL BP: <b>{latest.systolic ?? "—"}</b> /
                  <b>{latest.diastolic ?? "—"}</b>
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03, boxShadow: '0 8px 32px #ffd3b6' }}>
          <Card className="w-full min-h-[230px] flex flex-col animate-float-2">
            <div className="flex items-center gap-2 mb-4">
              <FaPills className="text-2xl text-hs-soft-pink" />
              <span className="font-bold text-2xl">Today's Medications</span>
            </div>
            {meds.length === 0 ? (
              <div className="text-gray-400">No medicines set.</div>
            ) : (
              <ul className="space-y-2">
                {meds.slice(-6).reverse().map((m, i) =>
                  <li key={i} className="flex justify-between items-center rounded bg-hs-blue p-3 shadow-lg w-full">
                    <span className="font-semibold">{m.name}</span>
                    <span className={`px-3 py-1 rounded font-bold text-xs uppercase ${m.status === "Taken"
                      ? "bg-green-100 text-green-700"
                      : m.status === "Missed"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {m.status}
                    </span>
                  </li>
                )}
              </ul>
            )}
            <span className="text-xs mt-3 text-gray-500">Manage medicines in the Medications page.</span>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}