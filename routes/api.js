const express = require('express');
const router = express.Router();
// const models = require('../models');
const md5 = require('md5');
var nodemailer = require('nodemailer');
var listID = process.env.LISTID;

const threshholds = [3,5,10,20]

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  }
});

// var mailOptions = {
//   from: process.env.EMAIL,
//   to: 'paul.christophe6@gmail.com',
//   subject: 'Email test working',
//   text: 'this is a test to make sure that the email sender is verifying and sending',
// };

const Mailchimp = require('mailchimp-api-v3')
const mailchimp = new Mailchimp(process.env.MAILCHIMP_KEY);

var mongoose = require('mongoose');
mongoose.connect('mongodb://captaindaylight:' + encodeURIComponent(process.env.DBPASS) + '@loremproduction-shard-00-00-i94rt.mongodb.net:27017,loremproduction-shard-00-01-i94rt.mongodb.net:27017,loremproduction-shard-00-02-i94rt.mongodb.net:27017/'+ process.env.DB +'?ssl=true&replicaSet=loremproduction-shard-0&authSource=admin',{
  useMongoClient: true
});
var db = mongoose.connection;
db.on('error', function(err) {
  console.log('error', err);
});
db.once('open', function() {
  var referrerSchema = mongoose.Schema({
    email: String,
    referrals: [String],
  });
  var Referrer = mongoose.model('Referrer', referrerSchema);

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
        let newReferrals = user.merge_fields.REFERRALS;

        if (user.merge_fields.REFERRALS.indexOf(newEmail) < 0) {
          newReferrals = newReferrals === '' ? newEmail : user.merge_fields.REFERRALS + ',' + newEmail;
        }

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

            Referrer.findOne({ email: user.email_address }, function(err, referrer) {
              if (referrer) {
                Referrer.findOneAndUpdate(
                  { email: user.email_address },
                  {
                    $push: { referrals: newEmail },
                  },
                  { upsert: true, new: true },
                  function(err, referrer) {
                    console.log('created or updatet', referrer);
                  }
                );
              } else {
                // create new referrer
                const newReferrer = new Referrer({
                  email: user.email_address,
                  referrals: user.merge_fields.REFERRALS !== '' ? user.merge_fields.REFERRALS.split(',') : [newEmail],
                });
                newReferrer.save(function(err, r) {
                  console.log('created new referrer', r);
                });
              }
            });

            if (user.merge_fields.REFERRALS !== '') {
              const referralsCount = user.merge_fields.REFERRALS.split(',').length;
              const threshholdIdx = threshholds.indexOf(referralsCount);

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
});

mailchimp.get({
  path: 'lists/' + listID + '/members'
}).then(function (result) {
    result.members.forEach((m) => {
      console.log(m.unique_email_id, m.email_address);
    })
  })
  .catch(function (err) {
    console.log('err', err);
  });

module.exports = router;
