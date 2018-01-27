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
  multipleStatements: true,
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
  let SQLquery = `SELECT code, name, score, href, depcode, count(coursecomment_id) as sumComments FROM course
                  LEFT JOIN course_comment ON course.code = course_comment.course_code
                     WHERE ( code LIKE '%${ req.query.srchstr }%' 
                     OR name LIKE '%${ req.query.srchstr }%') 
                     AND depcode IN (${ req.query.dep })
                     GROUP BY code`;

  if (req.query.srchstr === 'empty') {
    SQLquery = `SELECT * FROM course WHERE depcode IN (${ req.query.dep })`;
  }
  console.log(SQLquery);
  connection.query(SQLquery, (err, result) => {
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
            { sumComments: row.sumComments },
          ],
        })
      );
    }).join('')) : ('<nofound>No courses found</nofound>')) + '</courses>';
    res.send(data);
  });
});

app.get('/course/:courseCode', async(req, res) => {
  const noRating = 'No rating';
  const requestURL = `https://www.kth.se/api/kopps/v2/course/${ req.params.courseCode }`;

  const SQLquery = `SELECT code, course.name, score, coursecomment_id, user.name as userName, user.user_id, text, timeCreated FROM course 
                      LEFT JOIN course_comment ON course.code = course_comment.course_code
                      LEFT JOIN comment ON course_comment.coursecomment_id = comment.comment_id
                      LEFT JOIN user ON course_comment.user_id = user.user_id
                        WHERE code = '${ req.params.courseCode }'
                      ORDER BY timeCreated DESC`;

  const apidata = await request(requestURL).then((response) => { return JSON.parse(response); })
      .catch((error) => error.toString());

  connection.query(SQLquery, (err, result) => {
    if (err) { console.log(err); }
    const commentsSeen = [];
    const comments = [];
    for (const row of result) { 
      if (!commentsSeen.includes(row.coursecomment_id)) {
        comments.push({ comment: [
          { commentId: row.coursecomment_id },
          { userID: row.user_id },
          { userName: row.userName },
          { commentText: row.text },
          row.timeCreated ? { timeCreated: `${ row.timeCreated.getFullYear() }/${ row.timeCreated.getMonth() + 1 }/${ row.timeCreated.getDate() + 1 } - ${ row.timeCreated.getHours() }:${ row.timeCreated.getMinutes() }` } : (false),
        ]});
      }
    }
    const data =
        xml({
          course: [
            { name: result[0].name },
            { code: result[0].code },
            { href: apidata.href.sv },
            { courseWebUrl: apidata.courseWebUrl.sv },
            { info: apidata.info.sv ? (apidata.info.sv) : ('No info found...') },
            { level: apidata.level.sv },
            { score: result[0].score ? (result[0].score) : (noRating) },
            { comments: comments },
          ],
        });
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
  })
  .catch((error) => error.toString());
});

// --


function getSQLerrorMsg(SQLerror, name, email) {
  const SQLerrorMsg = SQLerror.sqlMessage;
  let errorMsg = 'no SQL-error';
  if (SQLerrorMsg.includes('name_UNIQUE')) {
    errorMsg = 'The user name ' + name + ' is already taken!';
  } else if (SQLerrorMsg.includes('name_TOO_SHORT') || SQLerrorMsg.includes('name_TOO_LONG')) {
    errorMsg = 'Your user name must be between 3 and 25 characters!';
  } else if (SQLerrorMsg.includes('email_UNIQUE')) {
    errorMsg = 'Another user is already registred with the email ' + email;
  } else if (SQLerrorMsg.includes('email_INVALID')) {
    errorMsg = email + ' is not a KTH-e-mail adress!';
  } else if (SQLerrorMsg.includes('email_TOO_SHORT')) {
    errorMsg = email + ' is not a valid e-mail adress';
  } else if (SQLerrorMsg.includes('password_TOO_SHORT')) {
    errorMsg = 'Your password has to be atleast 6 characters!';
  } else if (SQLerrorMsg.includes('password_TOO_LONG')) {
    errorMsg = 'Your password can not be larger than 48 characters!';
  } else if (SQLerrorMsg.includes('name_NONE_ALPHANUM')) {
    errorMsg = 'Your nick name can only contain letters and digits between A-Z / 0-9';
  }
  return errorMsg;
}


function sendUserInsertResult(resultData, res) {
  const scoreSeen = [];
  const commentSeen = [];
  const userScoresGiven = {};
  const userComments = [];
  for (const row of resultData) {
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
    userId: resultData[0].user_id,
    userName: resultData[0].name,
    userEmail: resultData[0].email,
    userScoresGiven: userScoresGiven,
    userComments: userComments,
  };
  res.json({
    reply: true,
    data: data,
    error: null,
  });
}

function sendUserError(errorMsg, res) {
  res.json({
    reply: false,
    data: null,
    error: errorMsg,
  });
}

function sendUserAlterResult(resultData, res, userid) {
  const data = {
    userId: userid,
    userName: resultData[0].name,
    userEmail: resultData[0].email,
  };
  res.json({
    reply: true,
    data: data,
    error: null,
  });
}


app.post('/user/reguser', jsonParser, (req, res) => {
  const [name, email, pass1, pass2, currentUserid, reg] = [req.body.newUser, req.body.newEmail, req.body.newPassword1, req.body.newPassword2, req.body.userID, req.body.reg];
  console.log('name:', name, 'email:', email, 'pass1:', pass1, 'pass2:', pass2, 'currentUserid:', currentUserid, 'reg:', reg);
  let errorMsg = false;
  let SQLquery;
  let SQLgetID;
  if (pass1 === pass2) {
    if (reg) {
      SQLquery = `INSERT INTO user (name, email, password) VALUES ('${ name }', '${ email }', '${ pass1 }');`;
      connection.query(SQLquery, (SQLError) => {
        if (SQLError) {
          errorMsg = getSQLerrorMsg(SQLError, name, email);
          sendUserError(errorMsg, res);
        } else {
          SQLgetID = 'SELECT LAST_INSERT_ID()';
          connection.query(SQLgetID, (getIDerr, getIDres) => {
            if (getIDerr) {
              errorMsg = getIDerr.sqlMessage;
              sendUserError(errorMsg, res);
            } else {
              const newUserid = parseInt(JSON.stringify(getIDres[0]).replace(/\D/g, ''), 10);
              const SQLgetData = `SELECT * FROM user WHERE user_id = ${ newUserid }`;
              connection.query(SQLgetData, (getDataErr, resultData) => {
                if (getDataErr) {
                  errorMsg = getDataErr.sqlMessage;
                  sendUserError(errorMsg, res);
                } else {
                  sendUserInsertResult(resultData, res);
                }
              });
            }
          });
        }
      });
    } else {
      SQLquery = `UPDATE user SET name = '${ name }', email = '${ email }', password = '${ pass1 }' WHERE user_id = ${ currentUserid }`;
      connection.query(SQLquery, (SQLError) => {
        if (SQLError) {
          errorMsg = getSQLerrorMsg(SQLError, name, email);
          sendUserError(errorMsg, res);
        } else {
          const SQLgetData = `SELECT * FROM user WHERE user_id = ${ currentUserid }`;
          connection.query(SQLgetData, (getDataErr, resultData) => {
            if (getDataErr) {
              errorMsg = getDataErr.sqlMessage;
              sendUserError(errorMsg, res);
            } else {
              sendUserAlterResult(resultData, res, currentUserid);
            }
          });
        }
      });
    }
  } else {
    errorMsg = 'Password fields doesn\'t match';
    sendUserError(errorMsg, res);
  }
});


function addslashes(str) {
  return (str + '')
  .replace(/[\\"']/g, '\\$&')
  .replace(/\u0000/g, '\\0')
  .replace(/\n\r?/g, '<br />');
}

app.post('/course/addcomment', jsonParser, (req, res) => {
  const escapedText = addslashes(req.body.commentText);
  const SQLquery = `START TRANSACTION;
                    INSERT INTO comment (text)
                      VALUES ('${ escapedText }');
                    INSERT INTO course_comment (coursecomment_id, course_code, user_id) 
                      VALUES (last_insert_id(), '${ req.body.courseCode }', ${ req.body.userId });
                    COMMIT;`;
  console.log(SQLquery);
  connection.query(SQLquery, (err, result) => {
    if (err) { console.log(err) }
    console.log(JSON.stringify(result));
    res.send({ commentId: result[1].insertId, courseCode: req.body.courseCode });
  });
});

app.post('/course/removecomment', jsonParser, (req, res) => {
  const escapedText = addslashes(req.body.commentText);
  const SQLquery = ` DELETE FROM course_comment WHERE coursecomment_id = ${ req.body.commentId }`;
  console.log(SQLquery);
  connection.query(SQLquery, (err, result) => {
    if (err) { console.log(err) }
    res.send({ commentId: req.body.commentId });
  });
});


app.listen(3000, () => console.log('server API listening on port 3000!'));