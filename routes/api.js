const express = require('express');
const router = express.Router();
const models = require('../models');

const Mailchimp = require('mailchimp-api-v3')
console.log(process.env.MAILCHIMP_KEY);

const mailchimp = new Mailchimp(process.env.MAILCHIMP_KEY);

mailchimp.get({
  path : 'lists/b3d938e5a2'
})
.then(function (result) {
  console.log('result', result);
})
.catch(function (err) {
  console.log('err', err);
})

router.get('/', function(req, res, next) {
  res.json({ status: true, data: 'WELCOME TO THE API' });
});

module.exports = router;
