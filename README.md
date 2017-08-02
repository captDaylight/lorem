# lorem

Update CSV:

`INPUT=data/test.csv COLUMN="Link ID" node addUniqueToCSV.js`


DEPLOYING TO NOW WITH ENVIRONMENT VARS
```
now deploy -e EMAIL=@email -e EMAIL_PASS=@email_pass -e MAILCHIMP_KEY=@mailchimp_key
```

goes live to
```
https://lorem-zcsxweeohr.now.sh
```

## TODO
- tack on the name of each email added to the user object
- get consistent now url so I don't have to keep updating the api call in squarespace
