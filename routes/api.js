const express = require('express');
const router = express.Router();
// const models = require('../models');

const Mailchimp = require('mailchimp-api-v3')
console.log(process.env.MAILCHIMP_KEY);

const mailchimp = new Mailchimp(process.env.MAILCHIMP_KEY);

mailchimp.get({
  path: 'lists/5def810f98/members'
})
.then(function (result) {
  console.log('---', result.members.length);
  // console.log('result', result);
  result.members.forEach((m) => {
    console.log(m.merge_fields);
  })
})
.catch(function (err) {
  console.log('err', err);
})

router.put('/user/:email', function(req, res, next) {
  if (!req.params.email) res.json({ result: 'error', msg: 'must send an email'});
  // update a specific member
  // https://developer.mailchimp.com/documentation/mailchimp/reference/lists/members/#
  mailchimp.get({
    path: 'lists/5def810f98/members/' + req.params.email,
  })
    .then(function(user) {
      console.log('success', user);
      const newRefCount = user.merge_fields.REF_COUNT === '' ? 1 : user.merge_fields.REF_COUNT + 1;
      mailchimp.patch({
        path: 'lists/5def810f98/members/' + req.params.email,
        body: {
          merge_fields: {
            REF_COUNT: newRefCount,
          }
        }
      })
        .then(function(user) {
          res.json({ result: 'success', data: user });
        })
    })
    .catch(function(data) {
      console.log('hmm', data);
      res.json({ result: 'error', msg: 'Could not find user.' });
    })
});

router.get('/', function(req, res, next) {
  res.json({ status: true, data: 'WELCOME TO THE API' });
});

module.exports = router;
