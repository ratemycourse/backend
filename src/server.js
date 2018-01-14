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

// --

function alphanum(inputtxt) {
  const letterNumber = /^[0-9a-zA-Z]+$/;
  if (inputtxt.match(letterNumber)) {
    return true;
  }
  return false;
}

function getSQLerrorMsg(SQLerror, name, email) {
  const errorMessage = SQLerror.sqlMessage;
  let errorMsg = 'no SQL-error';
  if (errorMessage.includes('email_UNIQUE')) {
    errorMsg = 'Another user is already registred with the email ' + email;
  } else if (errorMessage.includes('email_INVALID')) {
    errorMsg = email + ' is not a KTH-e-mail adress!';
  } else if (errorMessage.includes('email_TOO_SHORT')) {
    errorMsg = email + ' is not a valid e-mail adress';
  } else if (errorMessage.includes('name_UNIQUE')) {
    errorMsg = 'the user name ' + name + ' is already taken!';
  } else if (errorMessage.includes('name_TOO_SHORT') || errorMessage.includes('name_TOO_LONG')) {
    errorMsg = 'Your user name must be between 3 and 25 characters!';
  } else if (errorMessage.includes('password_UNIQUE')) {
    errorMsg = ' your password is too short!';
  } console.log(errorMsg);
  return errorMsg;
}

// TO DO : response.send() skicka felmeddelanden till front-end
app.post('/user/reguser', jsonParser, (req, res) => {
  const name = req.body.newUser;
  const email = req.body.newEmail;
  const pass1 = req.body.newPassword1;
  const pass2 = req.body.newPassword2;
  if (name === 'PURGE') { // REMOVE THIS STATEMENT AFTER DEVELOPMENT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let SQLpurge = 'DELETE FROM user WHERE user_id > 0';
    connection.query(SQLpurge);
    SQLpurge = 'SELECT * FROM user';
    connection.query(SQLpurge, (er, rs) => {
      if (er) {
        console.log(er);
      } else {
        console.log('-------user table: ', rs);
      }
    });
    console.log('table user purged');
  } else if (name === 'SELECT') { // REMOVE THIS STATEMENT AFTER DEVELOPMENT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const SQLselect = 'SELECT * FROM user';
    connection.query(SQLselect, (er, rs) => {
      if (er) {
        console.log(er);
      } else {
        console.log('-------user table: ', rs);
      }
    });
    console.log('table user purged');
  } else if (alphanum(name) === false) {
    console.log('Your nick name can only contain letters and digits between A-Z / 0-9');
  } else if (pass1 !== pass2) {
    console.log('Password fields doesn\'t match');
    console.log('   Password1', pass1);
    console.log('   Password2', pass2);
  } else {
    // försöker skriva till SQL-db
    const SQLregister = `INSERT INTO user (name, email, password) VALUES ('${ name }', '${ email }', '${ pass1 }');`;
    connection.query(SQLregister, (error) => {
      if (error) {
        // SQL gav ett error
        const errorMsg = getSQLerrorMsg(error, name, email);
        res.json({
          reply: false,
          data: {errorMsg: errorMsg},
        });
      } else {
        const SQLgetID = 'SELECT LAST_INSERT_ID()';
        connection.query(SQLgetID, (getIDerr, getIDres) => {
          if (getIDerr) {
            const getIDerrMsg = getIDerr.sqlMessage;
            res.json({
              reply: false,
              data: {errorMessage: getIDerrMsg},
            });
          } else {
            const userID = parseInt(JSON.stringify(getIDres[0]).replace(/\D/g, ''), 10);
            const SQLgetData = `SELECT * FROM user WHERE user_id = ${ userID }`;

            connection.query(SQLgetData, (getDataErr, resultData) => {
              if (getDataErr) {
                console.log('ERROR getting data from database!');
              } else {
                res.json({
                  reply: true,
                  data: resultData[0],
                });
                console.log('(¯`·._.·(¯`·._.· Register success! ·._.·´¯)·._.·´¯) ');
                /* console.log('   Name', name);
                console.log('   E-mail', email);
                console.log('   Password1', pass1);
                console.log('   Password2', pass2);
                console.log('   userID', userID);
                const ciphertext = CryptoJS.AES.encrypt(pass1, 'secret key 123'); // chiper
                const bytes = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123'); // conv to hex
                const plaintext = bytes.toString(CryptoJS.enc.Utf8);  // dechiper */
              }
            });
          }
        });
      }
    });
  }
});

app.listen(3000, () => console.log('server API listening on port 3000!'));
