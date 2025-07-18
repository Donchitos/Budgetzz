// 1. Load environment variables from the .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose'); // 2. Import mongoose

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// --- DATABASE CONNECTION ---
// 3. Use the MONGO_URI from your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    // 4. Start the server only AFTER the database connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });


// A simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});