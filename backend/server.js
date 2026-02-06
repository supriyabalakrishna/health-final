require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// In-memory users & records storage
let users = []; // [{ name, email, username, password }]
let patientRecords = {}; // { username: { medicines: [], vitals: [], history: [], reminders: [], caregiver: "" } }

// Signup
app.post('/api/auth/signup', (req, res) => {
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password)
    return res.status(400).json({ success: false, message: 'All fields required.' });
  if (users.find(u => u.email === email || u.username === username))
    return res.status(400).json({ success: false, message: 'Email or username exists.' });
  users.push({ name, email, username, password });
  patientRecords[username] = { medicines: [], vitals: [], history: [], reminders: [], caregiver: "" };
  res.json({ success: true, user: { name, email, username, token: 'mock-token-123' } });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user)
    return res.json({ success: true, user: { name: user.name, email: user.email, username, token: 'mock-token-123' } });
  res.status(401).json({ success: false, message: 'Invalid credentials.' });
});

// Add Medicine
app.post('/api/medicines', (req, res) => {
  const { username, medicine } = req.body;
  if (!patientRecords[username]) return res.status(404).json({ success: false, message: 'User not found.' });
  patientRecords[username].medicines.push({ ...medicine, status: "Pending" });
  res.json({ success: true });
});

// Get Medicines
app.get('/api/medicines/:username', (req, res) =>
  res.json({ medicines: patientRecords[req.params.username]?.medicines || [] })
);

// Update Medicine Status
app.post('/api/medicines/update', (req, res) => {
  const { username, index, status } = req.body;
  if (!patientRecords[username]) return res.status(404).json({ success: false });
  if (patientRecords[username].medicines[index]) {
    patientRecords[username].medicines[index].status = status;
    patientRecords[username].reminders.push({
      medicine: patientRecords[username].medicines[index].name,
      status,
      time: new Date().toLocaleString()
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

// Set Caregiver Contact
app.post('/api/caregiver', (req, res) => {
  const { username, caregiver } = req.body;
  if (!patientRecords[username]) return res.status(404).json({ success: false });
  patientRecords[username].caregiver = caregiver;
  res.json({ success: true });
});

// Email Reminder (mock)
app.post('/api/reminder/email', (req, res) => {
  const { username, medicine } = req.body;
  res.json({ success: true, message: `Reminder sent to ${users.find(u => u.username === username)?.email}` });
});

// Add Vitals
app.post('/api/vitals', (req, res) => {
  const { username, vitals } = req.body;
  if (!patientRecords[username]) return res.status(404).json({ success: false, message: 'User not found.' });
  patientRecords[username].vitals.push({ ...vitals, time: new Date().toLocaleString() });
  res.json({ success: true });
});

// Get Vitals
app.get('/api/vitals/:username', (req, res) =>
  res.json({ vitals: patientRecords[req.params.username]?.vitals || [] })
);

// Get Health History
app.get('/api/history/:username', (req, res) => {
  if (!patientRecords[req.params.username]) return res.status(404).json({ success: false });
  const { medicines, vitals, reminders } = patientRecords[req.params.username];
  res.json({ history: [...medicines, ...vitals, ...reminders] });
});

// ---- MEAL PLANNER: 1000+ dishes, 5 random ----
app.post('/api/mealplanner/generate', (req, res) => {
  const { caloriesGoal = 1200, vegetarian, bloodSugarBefore = 0, bloodSugarAfter = 0, systolic = 0, diastolic = 0 } = req.body;
  const date = new Date().toLocaleDateString();

  // 1000+ dishes: demo with realistic names and auto-generated filler
  const baseVegIndian = [
    "Poha", "Aloo Paratha", "Rajma Rice", "Chole Bhature", "Paneer Tikka",
    "Dhokla", "Idli", "Sambar Rice", "Baingan Bharta", "Dal Makhani",
    ...Array.from({length: 90}, (_,i)=>`Veg Indian Dish ${i+1}`)
  ];
  const baseNonVegIndian = [
    "Chicken Curry", "Egg Bhurji", "Mutton Biryani", "Fish Fry", "Egg Curry",
    ...Array.from({length: 90}, (_,i)=>`NonVeg Indian Dish ${i+1}`)
  ];
  const baseVegWestern = [
    "Caesar Salad", "Vegetarian Pizza", "Veggie Burger", "Fettuccine Alfredo", "Falafel Bowl",
    "Grilled Cheese", "Veggie Wrap", "Tomato Soup", "Quinoa Salad", "Eggplant Parmesan",
    ...Array.from({length: 410}, (_,i)=>`Veg Western Dish ${i+1}`)
  ];
  const baseNonVegWestern = [
    "Chicken Sandwich", "Grilled Salmon", "Beef Steak", "Chicken Alfredo", "Shrimp Tacos",
    "Ham Omelette", "Turkey Wrap", "Egg Muffin", "Fish & Chips", "Chicken Caesar Salad",
    ...Array.from({length: 410}, (_,i)=>`NonVeg Western Dish ${i+1}`)
  ];

  let pool = [];
  if (vegetarian) {
    pool = baseVegIndian.concat(baseVegWestern); // 500+ veg
  } else {
    pool = baseVegIndian.concat(baseVegWestern, baseNonVegIndian, baseNonVegWestern); // 1000+ total
  }

  // Pick 5 random, no repeats
  function pick(pool, count) {
    const arr = [];
    const clone = [...pool];
    for(let i=0; i<count && clone.length > 0; i++) {
      const idx = Math.floor(Math.random() * clone.length);
      arr.push(clone.splice(idx,1)[0]);
    }
    return arr;
  }

  const mealTypes = ["Breakfast", "Lunch", "Snack", "Dinner", "Anytime"];
  const perMeal = Math.round(caloriesGoal / 5);

  const picked = pick(pool, 5).map((name, i) => ({
    name,
    description: `${mealTypes[i]} suggestion`,
    calories: perMeal,
    date
  }));

  let advice = [`Date: ${date}`];
  if (bloodSugarBefore > 120 || bloodSugarAfter > 180) advice.push("High blood sugar: Prefer whole grains, avoid sugary/fried foods.");
  if (bloodSugarBefore < 50 || bloodSugarAfter < 70) advice.push("Low blood sugar: Include healthy carbs like fruit, moderate sweet.");
  if (systolic > 140 || diastolic > 90) advice.push("High blood pressure: Use less salt, avoid processed foods, add fruit/veggies.");
  if (caloriesGoal < 1200) advice.push("Low calorie goal: Add nutrient dense meals, nuts, legumes.");
  if (advice.length === 1) advice.push("You are in good balance, keep healthy habits!");

  res.json({
    plan: {
      advice,
      meals: picked
    }
  });
});

// Health check
app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));

app.listen(PORT, () => console.log(`HealthSync Backend running on http://localhost:${PORT}`));