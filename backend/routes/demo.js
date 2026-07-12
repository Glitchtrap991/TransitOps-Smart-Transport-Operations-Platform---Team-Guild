const express = require('express');
const router = express.Router();
const { resetDemoDatabase } = require('../controllers/demoController');

router.post('/reset', resetDemoDatabase);

module.exports = router;
