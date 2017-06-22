const csv = require('fast-csv');
const fs = require('fs');
const { INPUT, COLUMN } = process.env;

fs.createReadStream(INPUT)
  .pipe(csv())
  .on("data", function(data){
      console.log(data);
  })
  .on("end", function(){
      console.log("done");
  });
