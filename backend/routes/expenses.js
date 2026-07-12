const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getExpenses, createExpense } = require('../controllers/expenseController');

router.route('/')
  .get(protect, getExpenses)
  .post(protect, createExpense);

module.exports = router;
