var http = require('http');
var fs = require('fs');
var url = require('url');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var mysql = require('mysql')
const cookieParser = require('cookie-parser');
const sessions = require('express-session');

app.use(express.static('public'));

function connect (){ 
   return mysql.createConnection({
   host:'sigurd-mysql.mysql.database.azure.com', 
   user:'sigurd', password:'94verkTOYiskuFFen', 
   database:'mediadb', 
   port:3306, 
   ssl:{ca:fs.readFileSync('DigiCertGlobalRootCA.crt.pem')}
   });
}

const nDate = new Date().toLocaleString('nb-no', {
   timeZone: 'Europe/Oslo'
});

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24; // calculate one day

// express app should use sessions
app.use(sessions({
   secret: '8nstg89c269n3546m3u3p9lkvjskjdhrt',
   saveUninitialized:true,
   cookie: { maxAge: oneDay },
   resave: false 
}));

app.set('view engine', 'ejs');

// a variable to save a session
var session;

app.get('/test', function (req, res) {
   var con = connect();

   con.connect(function(err) {
      if (err) throw err;
      con.query('SELECT * FROM user', function (err, result, fields) {
         if (err) throw err;
         console.log(result);     
         var data = result; 
         var content = 'hallo';
 
         res.render('index.ejs', {
            data: data,
            content: content
         });
      });
   }); 
})

app.get('/', function (req, res) {
   if (req.query.msg) { console.log(req.query.error) }
   if (req.query.msg === 'deletedacc') { 
      message = 'Account was deleted'
   } else {message = null}
   
   if(req.session.userid){
      res.render('home.ejs', {
      userid: req.session.userid
   });
   } else {
      res.render('index.ejs', { message: message });
   }
})

app.get('/logout', function (req, res) {
   req.session.destroy();
   res.redirect('/');
})

app.get('/signup', function (req, res) {
   if (req.query.error) { console.log(req.query.error) }
   if (req.query.error === 'exists') { 
      message = 'User already exists' 
   } else {message = null}

   res.render('signup.ejs', { message: message });
})
app.post('/signup', (req, res) => {
 
   var con = connect();
   
   var username = req.body.username;
   var password = req.body.password;
   var gender = req.body.gender;
   var date_created = new Date();
   var last_login = new Date();

   // perform the MySQL query to check if the user exists
   var sqlCheck = 'SELECT * FROM user WHERE username = ?';
   
   con.query(sqlCheck, [username], (error, result) => {
      if (error) {
         res.status(500).send('Internal Server Error');
      } else if (result.length != 0) {
         res.redirect('/signup?error=exists'); // redirect with error message in GET
      } else {
         // insert new user into database
         var sql = 'INSERT INTO user (username, password, gender, date_created, last_login) VALUES (?, ?, ?, ?, ?)';
         var values = [username, password, gender, date_created, last_login];
         
         con.query(sql, values, (err, result) => {
            if (err) {
               throw err;
            }
            console.log('User ', username, ' inserted into database');
            res.redirect('/login?msg=createdacc');
         });
      }
   });
})

app.get('/login', function (req, res) {
   if (req.query.error) { console.log(req.query.error) }
   if (req.query.error === 'wronginfo') { 
      message = 'Wrong username or password' 
   } else if (req.query.msg === 'createdacc') {
      message = 'Account was created';
   } else {message = null}

   res.render('login.ejs', { message: message });
})

app.post('/login', function (req, res) {
   var con = connect();

   // get username and password from document on login
   var username = req.body.username;
   var password = req.body.password;

   // perform the MySQL query to check if the user exists
   var sql = 'SELECT * FROM user WHERE username = ? AND password = ?';
   
   con.query(sql, [username, password], (error, result) => {
      if (error) {
         res.status(500).send('Internal Server Error');
      } else if (result.length === 1) {
         req.session.userid=req.body.username; // set session userid to username
         console.log(username, ' logged in ', 'last_login: ', result[0].last_login);
         res.redirect('/handle-login');
      } else {
         res.redirect('/login?error=wronginfo'); // redirect with error message in GET
      }
   });
})

app.get('/handle-login', function (req, res) {
   var con = connect();

   var username = req.session.userid
   var last_login = new Date();
   var sql = 'UPDATE user SET last_login = ? WHERE username = ?';

   con.query(sql, [last_login, username], (error, result) => {
      if (error) {
         res.status(500).send('Internal Server Error');
      } else {
         console.log(username, ' last_login update: ', last_login);
         res.redirect('/');
      }
   });
})

app.get('/profile', function (req, res) {
   if(req.session.userid){
      var con = connect();

      var username = req.session.userid;
      var sql = 'SELECT bio FROM user WHERE username = ?';

      con.query(sql, [username], (err, result) => {
         if (err) throw err;
         req.session.bio = result[0].bio
                       
         res.render('profile.ejs', {
            userid: req.session.userid,
            bio: result[0].bio
       });
      });
   } else {
      res.redirect('/');
   }
})

app.get('/profile/', function (req, res) {
   if(req.session.userid){
      var con = connect();

      var username = req.session.userid;
      var sql = 'SELECT bio FROM user WHERE username = ?';

      con.query(sql, [username], (err, result) => {
         if (err) throw err;
         req.session.bio = result[0].bio
                       
         res.render('profile.ejs', {
            userid: req.session.userid,
            bio: result[0].bio
       });
      });
   } else {
      res.redirect('/');
   }
})

app.post('/update-bio', function (req, res) {
   var con = connect();

   var username = req.session.userid;
   var bio = req.body.bio;
   var sql = 'UPDATE user SET bio = ? WHERE username = ?';

   con.query(sql, [bio, username], (error, result) => {
      if (error) {
          res.status(500).send('Internal Server Error');
      } else {
         console.log(username, ' bio updated: ', bio);
         res.redirect('/profile');
      }
   });
})

app.get('/settings', function (req, res) {
   var con = connect();

   if(req.session.userid){
      res.render('settings.ejs', {

      });
   } 
   else {
      res.redirect('/');
   }
})

app.get('/delete-account', function (req, res) {
   var con = connect();

   // Check if the user is signed in by verifying the session or any authentication mechanism you have in place
   if (req.session.userid) {
       var username = req.session.userid;

       // Render a page with a form to enter the password
       res.render('delete-account.ejs', { username: username });
   } else {
       res.redirect('/login'); // Redirect to the login page if the user is not signed in
   }
})

// POST request to handle the password verification and delete the account
app.post('/delete-account', function (req, res) {
   var con = connect();

   // Check if the user is signed in by verifying the session or any authentication mechanism you have in place
   if (req.session.userid) {
      var username = req.session.userid;
      var password = req.body.password;

      // Perform the MySQL query to fetch the user's password from the database
      var selectSql = 'SELECT password FROM user WHERE username = ?';

      con.query(selectSql, [username], (error, results) => {
         if (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
         } else {
            if (results.length > 0) {
               var storedPassword = results[0].password;

               // Compare the entered password with the stored password
               if (password === storedPassword) {
                    // Perform the MySQL query to delete the user account
                    var deleteSql = 'DELETE FROM user WHERE username = ?';

                    con.query(deleteSql, [username], (error, results) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Internal Server Error');
                        } else {
                           // Account deletion successful
                           req.session.destroy(function (error) {
                              if (error) {
                                 console.log(error);
                              }
                                 res.redirect('/?msg=deletedacc');
                           });
                        }
                     });
               } else {
                  // Incorrect password
                  res.status(403).send('Incorrect password');
               }
            } else {
               // User not found
               res.status(404).send('User not found');
            }
         }
      });
   } else {
       res.redirect('/login');
   }
})

app.get('/about', function (req, res) {
   res.render('about.ejs');
})

var server = app.listen(80, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log('App listening at http://%s:%s', host, port)
})