const express = require('express');
const app = express();
const mysql = require('mysql');
const xml = require('xml');
const path = require('path');
const request = require('request-promise');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'test',
  password: 'cocacola',
  database: 'ratemycourseDB',
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Content-Type', 'application/xml');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/courses', (req, res) => {
  connection.connect();
  connection.query('SELECT * FROM dd', (err, result) => {
    if (err) { console.log(err); }
    const data = result.map((row) => {
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
    res.send(data);
    connection.end();
  });
});

app.get('/kthapi/courses/:depID', (req, res) => {
  const requestURL = `https://www.kth.se/api/kopps/v2/courses/${ req.params.depID }.json`;
  console.log(req.params);
  console.log(requestURL);
  request(requestURL).then((response) => {
    const fetched = JSON.parse(response);
    const header = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>';
    const data = header + '<courses>' + fetched.courses.map((course) => {
      return (
        xml({
          course: [
            {
              _attr: { code: course.code },
            },
            {title: course.title},
            {info: course.info},
            {href: course.href},
          ],
        })
      );
    }).join('') + '</courses>';
    res.send(data);
  });
});

app.get('/kthapi/departments', (req, res) => {
  const requestURL = 'https://www.kth.se/api/kopps/v2/departments.sv.json';
  request(requestURL).then((response) => {
    const fetched = JSON.parse(response);
    const data = '<departments>' + fetched.map((department) => {
      return (
        xml({
          department: [
            {code: department.code},
            {name: department.name},
            {href: `/kthapi/courses/${ department.code }`},
          ],
        })
      );
    }).join('') + '</departments>';
    res.send(data);
  });
});

app.listen(3000, () => console.log('server API listening on port 3000!'));
