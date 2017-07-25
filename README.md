# lorem

Update CSV:

`INPUT=data/test.csv COLUMN="Link ID" node addUniqueToCSV.js`


DEPLOYING TO NOW WITH ENVIRONMENT VARS
```
now -e EMAIL=@email -e EMAIL_PASS=@email_pass -e MAILCHIMP_KEY=@mailchimp_key
```

goes live to
```
https://lorem-zcsxweeohr.now.sh
```

## TODO
- fix cors issue after email submit https://medium.com/@littleStudent/cors-and-micro-services-with-now-sh-a805708a4e93
- tack on the name of each email added to the user object
