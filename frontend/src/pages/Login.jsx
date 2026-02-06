import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUnlock } from 'react-icons/fa';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await api.post('/auth/login', form);
      if (res.data.success) {
        localStorage.setItem('healthsync_token', res.data.user.token);
        localStorage.setItem('healthsync_user', JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else {
        setMsg(res.data.message || 'Login failed.');
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Login failed.');
    }
    setLoading(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-8 bg-hs-card rounded-2xl shadow-lg mt-16">
      <div className="flex items-center justify-center gap-2 mb-3">
        <FaUnlock size={34} className="text-hs-soft-pink" />
        <h2 className="text-2xl font-bold text-hs-soft-pink">Login to HealthSync</h2>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" required disabled={loading}
          className="w-full p-3 border rounded-lg focus:outline-none" value={form.username} onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required disabled={loading}
          className="w-full p-3 border rounded-lg focus:outline-none" value={form.password} onChange={handleChange} />
        <button type="submit" className="w-full py-3 rounded-xl bg-hs-soft-pink font-semibold hover:opacity-90 shadow-lg text-lg">
          {loading ? "Logging In…" : "Login"}
        </button>
        {msg && <div className="text-center text-red-500">{msg}</div>}
      </form>
    </motion.div>
  );
}