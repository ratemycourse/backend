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
  const noRating = 'No rating';
  let SQLquery = `SELECT * FROM course WHERE ( code LIKE '%${ req.query.srchstr }%' OR name LIKE '%${ req.query.srchstr }%') AND depcode IN (${ req.query.dep })`;
  if (req.query.srchstr === 'empty') {
    SQLquery = `SELECT * FROM course WHERE depcode IN (${ req.query.dep })`;
  }
  console.log(SQLquery);
  connection.query(SQLquery, (err, result) => {
    console.log(result);
    if (err) { console.log(err); }
    const data = '<courses>' + (result.length > 0 ? (result.map((row) => {
      return (
        xml({
          course: [
            {
              _attr: { code: row.code },
            },
            { name: row.name },
            { href: row.href },
            { department: row.depcode },
            { score: row.score ? (row.score) : (noRating) },
          ],
        })
      );
    }).join('')) : ('<nofound>No courses found</nofound>')) + '</courses>';
    res.send(data);
  });
});

app.get('/course/:courseCode', async (req, res) => {
  const noRating = 'No rating';
  const requestURL = `https://www.kth.se/api/kopps/v2/course/${ req.params.courseCode }`;
  const SQLquery = `SELECT * FROM course WHERE code = '${ req.params.courseCode }'`;
  const apidata = await request(requestURL).then((response) => { return JSON.parse(response); });

  connection.query(SQLquery, (err, result) => {
    if (err) { console.log(err); }
    const data = result.map((row) => {
      return (
        xml({
          course: [
            { name: row.name },
            { code: row.code },
            { href: apidata.href.sv },
            { courseWebUrl: apidata.courseWebUrl.sv },
            { info: apidata.info.sv ? (apidata.info.sv) : ('No info found...') },
            { level: apidata.level.sv },
            { score: 3.5 /* row.score ? (row.score) : (noRating) */ },
            { comments: row.comments },
          ],
        })
      );
    }).join('');
    res.send(data);
  }); 
});

const jsonParser = bodyParser.json();

app.post('/user/validate', jsonParser, (req, res) => {
  const SQLquery = `SELECT user.user_id, name, email, scores.course_code, score_given, course_comment.coursecomment_id FROM user 
                      LEFT JOIN scores ON user.user_id = scores.user_id
                      LEFT JOIN course_comment ON user.user_id = course_comment.user_id
                      LEFT JOIN comment ON course_comment.coursecomment_id = comment.comment_id
                        WHERE ( name = '${ req.body.user }'
                        OR email = '${ req.body.user }' )
                        AND password = BINARY '${ req.body.password }';`;
  console.log(SQLquery);
  connection.query(SQLquery, (err, result) => {
    if (err) { console.log(err); }
    if (result.length > 0) {
      const scoreSeen = [];
      const commentSeen = [];
      const userScoresGiven = {};
      const userComments = [];
      for (const row of result) {
        if (!scoreSeen.includes(row.course_code) && row.course_code !== null) {
          userScoresGiven[row.course_code] = row.score_given;
          scoreSeen.push(row.course_code);
        }
        if (!commentSeen.includes(row.coursecomment_id) && row.coursecomment_id !== null) {
          userComments.push(row.coursecomment_id);
          commentSeen.push(row.coursecomment_id);
        }
      }
      const data = {
        userId: result[0].user_id,
        userName: result[0].name,
        userEmail: result[0].email,
        userScoresGiven: userScoresGiven,
        userComments: userComments,
      };
      res.json({
        reply: true,
        data: data,
      });
    } else {
      res.json({
        reply: false,
        data: {},
      });
    }
  });
});

app.post('/user/submitscore', jsonParser, (req, res) => {
  console.log(req.body);
  const SQLquery = `REPLACE INTO scores (user_id, course_code, score_given) 
                    VALUES (${ req.body.userID }, '${ req.body.courseCode }', ${ req.body.score })`;
  connection.query(SQLquery, (err, result) => {
    if (err) { console.log(err); }
    res.send({ courseCode: req.body.courseCode, userScore: req.body.score });
  });
});

app.get('/kthapi/departments', (req, res) => {
  const requestURL = 'https://www.kth.se/api/kopps/v2/departments.sv.json';
  request(requestURL).then((response) => {
    res.json(response);
  });
});

app.listen(3000, () => console.log('server API listening on port 3000!'));
