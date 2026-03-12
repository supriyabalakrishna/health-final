import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiShieldCheck } from 'react-icons/hi';

const AIInsights = ({ vitals, history }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const username = JSON.parse(localStorage.getItem("healthsync_user"))?.username;

  const fetchInsights = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/ai/insights', { username, vitals, history });
      setInsights(response.data.advice || []);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [vitals]);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-card border border-hs-green/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <HiSparkles className="text-hs-green text-2xl animate-pulse" />
          AI Health Insights
        </h3>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="text-xs font-medium text-hs-blue-600 hover:text-hs-blue-800 transition-colors bg-hs-blue/10 px-3 py-1 rounded-full"
        >
          {loading ? "Analyzing..." : "Refresh"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 animate-shimmer rounded-lg" />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {insights.length > 0 ? (
              insights.map((tip, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-xl bg-hs-green/5 border border-hs-green/10">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hs-green/20 flex items-center justify-center text-hs-green font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-inter">{tip}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4 italic text-sm">No insights available at the moment. Try syncing your vitals!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
        <HiShieldCheck className="text-yellow-600 text-lg flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-yellow-800 leading-tight">
          Disclaimer: AI insights are for informational purposes only. Consult a healthcare professional for clinical decisions.
        </p>
      </div>
    </div>
  );
};

export default AIInsights;
