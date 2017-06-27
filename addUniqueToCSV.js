const csv = require('fast-csv');
const fs = require('fs');
const md5 = require('md5');
const { INPUT, COLUMN } = process.env;
// const writableStream = fs.createWriteStream(INPUT.split('.csv')[0] + '_modified.csv');

let isFirst = true;
let columnIndex;
let emailIndex

fs.createReadStream(INPUT)
  .pipe(csv())
  .pipe(csv.createWriteStream({headers: true}))
  .transform((data) => {
    if (isFirst) {
      isFirst = false;
      columnIndex = data.findIndex((d) => d === COLUMN);
      emailIndex = data.findIndex((d) => d === 'Email Address');
      return data;
    }
    data[columnIndex] = md5(data[emailIndex])
    return data;
  })
  .pipe(fs.createWriteStream(INPUT.split('.csv')[0] + '_modified.csv', {encoding: "utf8"}));
  // .pipe(writableStream)
