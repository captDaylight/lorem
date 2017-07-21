const express = require('express');
const router = express.Router();
// const models = require('../models');
var nodemailer = require('nodemailer');

const threshholds = [3,5,10,20]

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  }
});

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
          console.log('GRET', user.merge_fields.REF_COUNT);

          const threshholdIdx = threshholds.indexOf(user.merge_fields.REF_COUNT);
          if (threshholdIdx >= 0) {
            var mailOptions = {
              from: process.env.EMAIL,
              to: 'paul.christophe6@gmail.com',
              subject: 'Referral threshhold met',
              text: user.email_address + ' met threshhold ' + threshholds[threshholdIdx],
            };
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
          }
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
