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
- check if you can add query parameters to squarespace
- add a way to notify when a threshhold has been met
