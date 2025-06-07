const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
// 🔧 Load environment variables from .env file
require('dotenv').config();

// 🔑 Load API key from environment variables
const apiKey = process.env.ANTHROPIC_API_KEY;

// ✅ Check if API key is loaded properly
if (apiKey) {
  console.log(`✅ API Key loaded successfully (starts with: ${apiKey.substring(0, 15)}...)`);
} else {
  console.error('❌ ANTHROPIC_API_KEY not found in .env file!');
  console.error('💡 Make sure you have a .env file with: ANTHROPIC_API_KEY=your_key_here');
  process.exit(1); // Stop the server if no API key
}
// Create an Express application instance
const app = express();
const PORT = 5000;

// Connect to MongoDB database named "modular_skills"
mongoose.connect('mongodb://127.0.0.1:27017/modular_skills', { useNewUrlParser: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Middleware setup
app.use(cors());
// Parse incoming JSON requests with a size limit of 5MB
app.use(bodyParser.json({ limit: '5mb' }));
// Parse URL-encoded data  with a size limit of 5MB
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// Import route handler modules
const teachersRouter = require('./routers/teachers.route');
const studentsRouter = require('./routers/students.route');
const notificationsRouter = require('./routers/notifications.route');
const studentNotificationsRouter = require('./routers/studentNotifications.route');
const summaryRouter = require('./routers/summary.route');
const classesRouter = require('./routers/classes.route');
const claudeRoutes = require('./routers/claude.route');

// Route binding — register the route handlers under specific paths
app.use('/api/teachers', teachersRouter);
app.use('/api/students', studentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/studentNotifications', studentNotificationsRouter);
app.use('/api', summaryRouter);
app.use('/api/classes', classesRouter);
app.use('/api/claude', claudeRoutes);

// Start the Express server
app.listen(PORT, (err) => {
  if (!err) console.log(`🚀 Server running at http://localhost:${PORT}`);
  else console.log("❌ Server error:", err);
});
