# lorem

Update CSV:

`INPUT=data/test.csv COLUMN="Link ID" node addUniqueToCSV.js`


DEPLOYING TO NOW WITH ENVIRONMENT VARS
```
now deploy -e EMAIL=@email -e EMAIL_PASS=@email_pass -e MAILCHIMP_KEY=@mailchimp_key -e LISTID=@listid -e DB=@db -e DBPASS=@dbpass
```

ALIASING
```
now alias https://lorem-npcnzjzopx.now.sh lorem-ipsum-now
```

goes live to
```
https://lorem-zcsxweeohr.now.sh
```

## TODO
- add any referrers in mailchimp to teh db
- display names on the website
- person can't add their own email Address
