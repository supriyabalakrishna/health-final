import React, { useState } from 'react';
import Card from '../components/Card';
import Loader from '../components/Loader';
import api from '../api/axios';
import { FaLeaf, FaDrumstickBite, FaComments, FaCalendarDay } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function MealPlanner() {
  const [caloriesGoal, setCaloriesGoal] = useState(1200);
  const [vegetarian, setVegetarian] = useState(true);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setPlan(null);
    try {
      const res = await api.post('/mealplanner/generate', {
        caloriesGoal,
        vegetarian,
      });
      setPlan(res.data.plan);
    } catch (err) {
      setMsg('Failed to generate meal plan.');
    }
    setLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full flex flex-col items-center"
    >
      <Card className="w-full max-w-6xl mb-8">
        <h2 className="font-bold text-3xl mb-3 text-center animate-pulse">Smart AI Meal Planner 🍱</h2>
        <form className="flex flex-col md:flex-row justify-center items-center gap-7 mb-4" onSubmit={handleGenerate}>
          <div>
            <label className="font-semibold">Calories Goal</label>
            <input type="number" value={caloriesGoal}
              onChange={e => setCaloriesGoal(Number(e.target.value))}
              min={500} max={3000} step={100}
              className="w-full p-2 border-2 border-hs-soft-pink rounded-xl font-bold" required disabled={loading}
            />
          </div>
          <div>
            <label className="font-semibold">Type</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setVegetarian(true)} className={`px-7 py-2 rounded-xl font-bold border-2 ${vegetarian ? "bg-hs-green border-hs-soft-pink text-hs-soft-pink shadow-lg" : ""}`}>
                <FaLeaf /> Veg
              </button>
              <button type="button" onClick={() => setVegetarian(false)} className={`px-7 py-2 rounded-xl font-bold border-2 ${!vegetarian ? "bg-hs-soft-pink border-hs-green text-hs-green shadow-lg" : ""}`}>
                <FaDrumstickBite /> Non-Veg
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="px-7 py-3 bg-gradient-to-r from-hs-green to-hs-soft-pink rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition">
            {loading ? 'Generating...' : 'Generate AI Plan'}
          </button>
        </form>
        {msg && <div className="text-center text-red-500 mt-4">{msg}</div>}
        {plan && plan.advice &&
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-hs-green p-4 rounded-xl text-lg flex items-center gap-2 w-full mb-4">
            <FaCalendarDay /> {plan.advice.join(' | ')}
          </motion.div>
        }
      </Card>
      {loading && <Loader />}
      {plan && plan.meals?.length > 0 && (
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="grid gap-8 w-full max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {plan.meals.map((meal, idx) => (
            <motion.div key={idx}
              whileHover={{ scale: 1.07, boxShadow: '0 8px 32px #ffd3b6' }}
              className="bg-gradient-to-br from-hs-green via-hs-soft-pink to-hs-blue rounded-3xl shadow-2xl p-7 flex flex-col justify-between hover:ring-2 ring-hs-soft-pink transition duration-300 min-w-[280px] max-w-full"
            >
              <h3 className="font-bold text-2xl mb-1 text-hs-soft-pink">{meal.name}</h3>
              <div className="text-gray-700 mb-2 text-base font-semibold">{meal.description}</div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-hs-soft-pink">Calories: {meal.calories}</span>
                <span className="text-xs bg-hs-blue px-2 py-1 rounded">{meal.date}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}