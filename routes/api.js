const express = require('express');
const router = express.Router();
const models = require('../models');

router.get('/', function(req, res, next) {
  res.json({ status: true, data: 'WELCOME TO THE API' });
});

module.exports = router;
