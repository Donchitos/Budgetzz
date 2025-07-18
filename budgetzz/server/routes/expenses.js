const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense'); // Import our Expense model

// --- DEFINE THE ROUTES ---

// @route   GET /api/expenses
// @desc    Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 }); // Get all, sort by newest first
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/expenses
// @desc    Add a new expense
router.post('/', async (req, res) => {
  try {
    const newExpense = new Expense({
      description: req.body.description,
      amount: req.body.amount
    });

    const expense = await newExpense.save(); // Save it to the database
    res.json(expense); // Send the new expense back as a response
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;