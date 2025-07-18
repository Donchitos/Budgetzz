require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// --- DEFINE ROUTES ---
// Tell the app to use our new expenses routes for any URL starting with /api/expenses
app.use('/api/expenses', require('./routes/expenses'));


// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// We can now remove the old test route as our new file handles routes
// app.get('/api/test', (req, res) => { ... });