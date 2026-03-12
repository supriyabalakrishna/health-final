require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

// ---- AI HEALTH INSIGHTS ----
app.post('/api/ai/insights', async (req, res) => {
  const { username, vitals, history } = req.body;
  
  if (!openai.apiKey) {
    return res.json({ advice: ["AI insights are currently unavailable (Missing API Key)."] });
  }

  try {
    const prompt = `You are a helpful health assistant. Based on these patient vitals: ${JSON.stringify(vitals)} and recent health history: ${JSON.stringify(history)}, provide 3 concise, actionable health tips. 
    IMPORTANT: Start with a medical disclaimer. Be supportive but professional. Return only the tips as a JSON array of strings.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "You are a professional medical assistant." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json({ advice: result.tips || result.advice || [] });
  } catch (error) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate AI insights." });
  }
});

// ---- AI SYMPTOM CHECKER ----
app.post('/api/ai/symptom-check', async (req, res) => {
  const { symptoms } = req.body;

  if (!openai.apiKey) {
    return res.json({ analysis: "Symptom checker is currently unavailable." });
  }

  try {
    const prompt = `A user is reporting these symptoms: "${symptoms}". 
    1. Provide a brief analysis of potential causes.
    2. Suggest next steps (e.g., monitor, see a doctor).
    3. CRITICAL: If symptoms sound like an emergency (chest pain, severe bleeding, etc.), state clearly that they should seek IMMEDIATE emergency care.
    Return as a concise summary.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "You are a professional medical triage assistant. You provide information, not a diagnosis." }, { role: "user", content: prompt }],
    });

    res.json({ analysis: completion.choices[0].message.content });
  } catch (error) {
    console.error("AI Symptom Check Error:", error);
    res.status(500).json({ success: false, message: "Failed to check symptoms." });
  }
});

// ---- MEAL PLANNER: AI Powered ----
app.post('/api/mealplanner/generate', async (req, res) => {
  const { caloriesGoal = 1200, vegetarian, bloodSugarBefore = 0, bloodSugarAfter = 0, systolic = 0, diastolic = 0 } = req.body;
  const date = new Date().toLocaleDateString();

  if (!openai.apiKey) {
    // Fallback to old logic if no API key
    return res.json({ plan: { advice: ["AI Meal Planning unavailable. Showing standard suggestions."], meals: [{name: "Oatmeal", description: "Healthy Breakfast", calories: 300, date}] } });
  }

  try {
    const prompt = `Generate a 1-day meal plan (5 meals: Breakfast, Lunch, Snack, Dinner, Anytime) for a user with: 
    - Calorie Goal: ${caloriesGoal}
    - Vegetarian: ${vegetarian}
    - Recent BP: ${systolic}/${diastolic}
    - Recent Blood Sugar: ${bloodSugarBefore}/${bloodSugarAfter}
    
    Return a JSON object with:
    1. "advice": Array of 2-3 specific nutritional tips based on their data.
    2. "meals": Array of 5 objects each with "name", "description", "calories".
    
    Make it delicious and medically appropriate.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "You are a professional nutritionist." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json({
      plan: {
        advice: result.advice || [],
        meals: (result.meals || []).map(m => ({ ...m, date }))
      }
    });
  } catch (error) {
    console.error("AI Meal Planner Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate meal plan." });
  }
});

// Health check
app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));

app.listen(PORT, () => console.log(`HealthSync Backend running on http://localhost:${PORT}`));