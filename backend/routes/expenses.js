const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
const { getExpenses, createExpense } = require('../controllers/expenseController');

router.route('/')
  .get(getExpenses)
  .post(createExpense);

module.exports = router;
