const express = require('express');
const router = express.Router();
// const models = require('../models');
const md5 = require('md5');
var nodemailer = require('nodemailer');
var listID = '2ef70b0e24';

var mongoose = require('mongoose');
mongoose.connect('mongodb://captaindaylight:' + encodeURIComponent(process.env.DBPASS) + '@loremproduction-shard-00-00-i94rt.mongodb.net:27017,loremproduction-shard-00-01-i94rt.mongodb.net:27017,loremproduction-shard-00-02-i94rt.mongodb.net:27017/'+ process.env.DB +'?ssl=true&replicaSet=loremproduction-shard-0&authSource=admin',{
  useMongoClient: true
});
var db = mongoose.connection;
db.on('error', function(err) {
  console.log('error', err);
});
db.once('open', function() {
  console.log('WERE ON');
  console.log(mongoose.connection.readyState);
  var kittySchema = mongoose.Schema({
    name: String
  });
  var Kitten = mongoose.model('Kitten', kittySchema);
  var silence = new Kitten({ name: 'Silence' });
  console.log(silence.name); // 'Silence'
  silence.save(function (err, cat) {
    if (err) return console.error(err);
    console.log('we have cat', cat);
  });
});

const threshholds = [3,5,10,20]
console.log('PASS', process.env.EMAIL_PASS);
console.log('PASS', process.env.EMAIL);
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  }
});

var mailOptions = {
  from: process.env.EMAIL,
  to: 'paul.christophe6@gmail.com',
  subject: 'Email test working',
  text: 'this is a test to make sure that the email sender is verifying and sending',
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

const Mailchimp = require('mailchimp-api-v3')

const mailchimp = new Mailchimp(process.env.MAILCHIMP_KEY);

// mailchimp.get({
//   path: 'lists/' + listID + '/members'
// })
// .then(function (result) {
//   result.members.forEach((m) => {
//     console.log(m.merge_fields);
//   })
// })
// .catch(function (err) {
//   console.log('err', err);
// })

router.put('/user/:email', function(req, res, next) {
  if (!req.params.email) res.json({ result: 'error', msg: 'must send an email'});
  // update a specific member
  // https://developer.mailchimp.com/documentation/mailchimp/reference/lists/members/#
  var newEmail = req.body.email ? req.body.email : '';
  console.log('sending to', 'lists/' + listID + '/members?unique_email_id=' + req.params.email);
  mailchimp.get({
    path: 'lists/' + listID + '/members?unique_email_id=' + req.params.email,
  })
    .then(function(search) {
      const user = search.members[0];
      console.log('HERERERE', user);
      let newReferrals = user.merge_fields.REFERRALS;
      console.log('new email', newEmail);
      console.log('index of', user.merge_fields.REFERRALS.indexOf(newEmail));
      if (user.merge_fields.REFERRALS.indexOf(newEmail) < 0) {
        newReferrals = newReferrals === '' ? newEmail : user.merge_fields.REFERRALS + ',' + newEmail;
      }
      console.log('newReferrals:', newReferrals);
      mailchimp.patch({
        path: 'lists/' + listID + '/members/' + md5(user.email_address.toLowerCase()),
        body: {
          merge_fields: {
            REFERRALS: newReferrals,
          }
        }
      })
        .then(function(user) {
          res.json({ result: 'success', data: user });
          console.log('SUCCESS');
          console.log(user.merge_fields.REFERRALS);
          if (user.merge_fields.REFERRALS !== '') {
            const referralsCount = user.merge_fields.REFERRALS.split(',').length;
            const threshholdIdx = threshholds.indexOf(referralsCount);
            console.log('referralsCount', referralsCount);
            if (threshholdIdx >= 0) {
              var mailOptions = {
                from: process.env.EMAIL,
                to: [
                  'tom+referrals@loremipsum.wtf',
                  'margot+referrals@loremipsum.wtf',
                  'referrals@loremipsum.wtf'],
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
          }

        })
    })
    .catch(function(data) {
      res.json({ result: 'error', msg: 'Could not find user.', data: data });
    })
});

router.get('/', function(req, res, next) {
  res.json({ status: true, data: 'WELCOME TO THE API' });
});

module.exports = router;
