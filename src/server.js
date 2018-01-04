const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql');
const xml = require('xml');
const path = require('path');
const request = require('request-promise');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'test',
  password: 'cocacola',
  database: 'ratemycoursedb',
});

connection.connect();

// Get all courses per department and write to Database.
async function getAllCourses(array) {
  for (const department of array) {
    const requestURL = `https://www.kth.se/api/kopps/v2/courses/${ department }.json`;
    let courses = await request(requestURL);
    courses = JSON.parse(courses);
    for (const course of courses.courses) {
      const SQLinsert = `INSERT IGNORE INTO course(code, name, score, href, depcode) VALUES('${ course.code }','${ course.title }', NULL, '/course/${ course.code }','${ department }')`;
      connection.query(SQLinsert, (err, result) => {
        if (err) { console.log(err); }
      });
    }
  }
  console.log('DONE UPDATIFYING!');
  return true;
}

const getCourse = (courseID) => {
  const requestURL = `https://www.kth.se/api/kopps/v2/course/${ courseID }`;
  return request(requestURL).then((response) => {
    return response;
  });
};

// Get all departmentcodes for loading courses from KTHs course API.
async function buildDB() {
  console.log('STARTING UPDATE!');
  const requestURL = 'https://www.kth.se/api/kopps/v2/departments.sv.json';
  const codes = [];
  let departments = await request(requestURL);
  departments = JSON.parse(departments);
  for (const department of departments) {
    codes.push(department.code);
  }
  return getAllCourses(codes);
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Loading relevant data to the RMC database.
app.get('/buildDB', (req, res) => {
  const update = async () => {
    const done = await buildDB();
    if (done) {
      res.send('><div>DATABASE UPDATED</div>');
    }
  };
  update();
});

app.get('/search/query', (req, res) => {
  let SQLquery = `SELECT * FROM course WHERE ( code LIKE '%${ req.query.srchstr }%' OR name LIKE '%${ req.query.srchstr }%') AND depcode IN (${ req.query.dep })`;
  if (req.query.srchstr === 'empty') {
    SQLquery = `SELECT * FROM course WHERE depcode IN (${ req.query.dep })`;
  }
  console.log(SQLquery);
  connection.query(SQLquery, (err, result) => {
    if (err) { console.log(err); }
    const data = '<courses>' + result.map((row) => {
      return (
        xml({
          course: [
            {
              _attr: { code: row.code },
            },
            {name: row.name},
            {href: row.href},
            {score: row.score},
            {department: row.depcode},
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
    res.json(response);
  });
});

app.listen(3000, () => console.log('server API listening on port 3000!'));
