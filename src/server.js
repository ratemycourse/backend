const express = require('express');
const app = express();
const mysql = require('mysql');
const xml = require('xml');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'test',
  password: 'cocacola',
  database: 'ratemycourseDB',
});

connection.connect();

app.use((req, res, next) => {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Content-Type', 'application/xml');
  next();
});

app.get('/', (req, res) => {
  connection.query('SELECT * FROM dd', (err, result) => {
    if (err) { console.log(err); }
    const data = '<courses>' + result.map((row) => {
      return (
        xml({
          course: [
            {
              _attr: { code: row.code },
            },
            {title: row.title},
            {info: row.info},
            {href: row.href},
            {score: row.score},
          ],
        })
      );
    }).join('') + '</courses>';
    console.log(data);
    res.send(data);
  });
});

app.listen(3000, () => console.log('server API listening on port 3000!'));
