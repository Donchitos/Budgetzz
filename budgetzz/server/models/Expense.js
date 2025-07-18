const mongoose = require('mongoose');

// This is the blueprint for an expense
const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true, // The description is mandatory
    trim: true      // Removes whitespace from both ends
  },
  amount: {
    type: Number,
    required: true  // The amount is mandatory
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set the creation date
  }
});

// Create the model from the schema and export it
module.exports = mongoose.model('Expense', ExpenseSchema);