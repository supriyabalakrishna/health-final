import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import api from '../api/axios';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setSuccess(false);
    try {
      const res = await api.post('/auth/signup', form);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          localStorage.setItem('healthsync_token', res.data.user.token);
          localStorage.setItem('healthsync_user', JSON.stringify(res.data.user));
          navigate("/dashboard");
        }, 1200);
      } else {
        setMsg(res.data.message || 'Signup failed.');
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Signup failed.');
    }
    setLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-8 bg-hs-card rounded-2xl shadow-lg mt-16"
    >
      <h1 className="font-bold text-2xl mb-5 text-center text-hs-soft-pink">Create HealthSync Account</h1>
      {success ? (
        <div className="flex flex-col items-center gap-2">
          <FaCheckCircle size={56} className="text-green-500 animate-bounce mb-2" />
          <div className="font-bold text-green-700 mb-3">Sign up successful! Redirecting…</div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" required disabled={loading}
            className="w-full p-3 border rounded-lg focus:outline-none" value={form.name} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" required disabled={loading}
            className="w-full p-3 border rounded-lg focus:outline-none" value={form.email} onChange={handleChange} />
          <input type="text" name="username" placeholder="Username" required disabled={loading}
            className="w-full p-3 border rounded-lg focus:outline-none" value={form.username} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" required disabled={loading}
            className="w-full p-3 border rounded-lg focus:outline-none" value={form.password} onChange={handleChange} />
          <button type="submit" className="w-full py-3 rounded-xl bg-hs-soft-pink font-semibold hover:opacity-90 shadow-lg text-lg">
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          {msg && <div className="text-center text-red-500">{msg}</div>}
        </form>
      )}
    </motion.div>
  );
}