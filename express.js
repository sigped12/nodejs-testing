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
   database:'jeppdb', 
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
   if (req.query.msg) { console.log('/ req.query.msg ', req.query.msg) }
   if (req.query.msg === 'deletedacc') { 
      message = 'Account was deleted'
   } if (req.query.msg === 'logout') { 
      message = 'Logged out of account'
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
   res.redirect('/?msg=logout');
})

app.get('/signup', function (req, res) {
   if (req.query.error) { console.log('/signup req.query.error ', req.query.error) }
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
         res.redirect('/signup?error=exists'); // redirect with error message
      } else {
         // insert new user into database
         var sql = 'INSERT INTO user (username, password, gender, date_created, last_login) VALUES (?, ?, ?, ?, ?)';
         var values = [username, password, gender, date_created, last_login];
         
         con.query(sql, values, (err, result) => {
            if (err) throw err;
            var visibility = 'private';
            // set defaults in settings table
            var sql = 'INSERT INTO settings (username, visibility) VALUES (?, ?)';
            con.query(sql, [username, visibility], (err, result) => {
               if (err) throw err;
               console.log(username, ' settings set')
            });

            console.log('User ', username, ' inserted into database');
            res.redirect('/login?msg=createdacc');
         });
      }
   });
})

app.get('/login', function (req, res) {
   if (req.query.error) { console.log('/login req.query.error ', req.query.error) }
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
         res.redirect('/login?error=wronginfo'); // redirect with error message
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

app.get('/settings', function (req, res) {
   if(req.session.userid){
      var con = connect();

      var username = req.session.userid;
      var sql = 'SELECT visibility FROM settings WHERE username = ?';
      con.query(sql, [username], (err, result) => {
         if (err) throw err;
         req.session.accvis = result[0].visibility

         if (result[0].visibility === 'private') {
            accvisis = 'private';
            accvisnot = 'public';
         } else if (result[0].visibility === 'public') {
            accvisis = 'public';
            accvisnot = 'private';
         } else {
            var accvisis = null;
            var accvisnot = null;
         }

         res.render('settings.ejs', {
            accvisis: accvisis,
            accvisnot: accvisnot
         });
      });
   } else {
      res.redirect('/');
   }
})

app.post('/account-visibility', function (req, res) {
   var con = connect();

   if(req.session.userid){
      if (req.session.accvis === 'private') {
         accvisset = 'public';
      } else if (req.session.accvis === 'public') {
         accvisset = 'private';
      }
      var visibility = accvisset;
      var username = req.session.userid;
      var sql = 'UPDATE settings SET visibility = ? WHERE username = ?';
      con.query(sql, [visibility, username], (err, result) => {
         if (err) throw err;
         else {
            console.log(username, ' updated account visibility: ', visibility);
            res.redirect('/settings');
         }
      });
   } else {
      res.redirect('/');
   }
})

app.get('/delete-account', function (req, res) {
   var con = connect();

   // Check if the user is signed in by verifying the session
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

   // Check if the user is signed in by verifying the session
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
                     // Delete settings
                     var deleteSql2 = 'DELETE FROM settings WHERE username = ?';
                     con.query(deleteSql2, [username], (error, results) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Internal Server Error');
                        } else {
                           console.log(username, ' settings deleted')
                        }
                     });

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

app.get('/user', function (req, res) {
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
   var bio = req.body.newbio;
   var sql = 'UPDATE user SET bio = ? WHERE username = ?';

   con.query(sql, [bio, username], (error, result) => {
      if (error) {
          res.status(500).send('Internal Server Error');
      } else {
         console.log(username, ' updated bio: ', bio);
         res.redirect('/user');
      }
   });
})

app.get('/user/:username', function (req, res) {
   if(req.session.userid){
      var con = connect();

      var username = req.params.username;
      console.log('req.params.username ', username)

      // check if the users profile is public or private
      var sqlCheck = 'SELECT visibility FROM settings WHERE username = ?';
      con.query(sqlCheck, [username], (err, result) => {
         if (err) throw err;
         if (result[0].visibility === 'private') {
            res.render('user.ejs', {
               message: 'Profile is private',
               userid: username,
               bio: null
            });
         } else if (result[0].visibility === 'public') {
            var sql = 'SELECT bio FROM user WHERE username = ?';
            con.query(sql, [username], (error, result) => {
               if (error) {
                  res.status(500).send('Internal Server Error');
               } else if (result.length === 1) {
                  var bio = result[0].bio
                  console.log(req.session.userid, ' opened ', username, ' profile');
                  res.render('user.ejs', {
                     message: null,
                     userid: username,
                     bio: bio
                  });
               } else {
                  res.redirect('/user/?error=wrong'); // redirect with error message
               }
            });
         }
      });
   } else {
      res.redirect('/');
   }
})

// "Cannot GET" when attempted to access?
app.get('user/:username/lists', function (req, res) {
   if(req.session.userid){
      var con = connect();

      var creator = req.params.username;
      var sql = 'SELECT * FROM list WHERE creator = ?';
      con.query(sql, [creator], (error, result) => {
         res.render('lists-others.ejs', {data: result, username: creator});
      });
   } else {
      res.redirect('/');
   }
})

app.get('/users', function(req, res) {
   if(req.session.userid){
      var con = connect();
      var sql = 'SELECT * FROM user';
      con.query(sql, (error, result) => {
         res.render('users.ejs', {data: result});
      });
   } else {
      res.redirect('/');
   }
})

app.get('/list/:id', function (req, res) {
   if(req.session.userid){
      var con = connect();

      var id = req.params.id

      var sql2 = 'SELECT * FROM list_entry WHERE list = ?';
      con.query(sql2, [id], (error, result) => {
         var data = result;
         var sql = 'SELECT * FROM list WHERE id = ?';
         con.query(sql, [id], (error, result) => {
            res.render('list.ejs', {
               data: data,
               id: result[0].id,
               creator: result[0].creator,
               name: result[0].name,
               description: result[0].description,
               date_created: result[0].date_created,
               date_updated: result[0].date_updated
            });
         });
      });

      
   } else {
      res.redirect('/');
   }
})

app.get('/lists', function(req, res) {
   if(req.session.userid){
      var con = connect();
      var creator = req.session.userid;
      var sql = 'SELECT * FROM list';
      con.query(sql, (error, result) => {
         res.render('lists-all.ejs', {data: result});
      });
   } else {
      res.redirect('/');
   }
})

app.get('/my-lists', function(req, res) {
   if(req.session.userid){
      var con = connect();
      if (req.query.action) { console.log('/my-lists req.query.action ', req.query.action) }
      if (req.query.action === 'create') { 
         res.render('list-create.ejs', {}); 
      } else {
         message = null;
         var creator = req.session.userid;
         var sql = 'SELECT * FROM list WHERE creator = ?';
         con.query(sql, [creator], (error, result) => {
            res.render('lists-my.ejs', {data: result});
         });
      }
   } else {
      res.redirect('/');
   }
})

app.post('/list-create', function (req, res) {
   var con = connect();

   var creator = req.session.userid;
   var name = req.body.name;
   var description = req.body.description;
   var date_created = new Date();
   var date_updated = new Date();
   var sql = 'INSERT INTO list (creator, name, description, date_created, date_updated) VALUES (?, ?, ?, ?, ?)';
   var values = [creator, name, description, date_created, date_updated];

   con.query(sql, values, (error, result) => {
      if (error) {
          res.status(500).send('Internal Server Error');
      } else {
         console.log(creator, ' created new list: ', name);
         res.redirect('/my-lists');
      }
   });
})

app.get('/about', function (req, res) {
   res.render('about.ejs');
})

var server = app.listen(80, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log('App listening at http://%s:%s', host, port)
})