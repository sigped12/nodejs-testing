var http = require('http');
var fs = require('fs');
var url = require('url');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var mysql = require('mysql')
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

app.use(express.static('public'));

function connect (){ 
   return mysql.createConnection({
   host:"sigurd-mysql.mysql.database.azure.com", 
   user:"sigurd", password:"94verkTOYiskuFFen", 
   database:"mediadb", 
   port:3306, 
   ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}
});
}

app.get('/test', function (req, res) {

   var con= connect();

   con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT * FROM user", function (err, result, fields) {
         if (err) throw err;
         console.log(result);     
         var data = result; 
         var content = "hallo";
 
         res.render('index.ejs', {
            data: data,
            content: content
 
       });
      });
 
   });
   
})

app.get('/express', function (req, res) {
   res.send('Request for express');
})

app.get('/about', function (req, res) {
   res.sendFile( __dirname + "/" + "about.html" );
})

app.get('/process_get', function (req, res) {
   response = {
      username:req.query.username,
      password:req.query.password
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
 
const oneDay = 1000 * 60 * 60 * 24; // calculate one day
 
// express app should use sessions
app.use(sessions({
    secret: "8nstg89c269n3546m3u3p9lkvjskjdhrt",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
 
// set the view engine to ejs
app.set('view engine', 'ejs');
 
// a variable to save a session
var session;
 
app.get('/', function (req, res) {
     session=req.session;
     if(session.userid){
      var loggedinas = session.userid;
         res.render('index.ejs', {
            userid: session.userid,
            loggedinas: loggedinas
        });
     } 
     else {
        res.render('login.ejs', { });
     }
})

app.get('/createaccount', function (req, res) {
   res.render('signup.ejs');
 
})
 
app.get('/logout', function (req, res) {
   req.session.destroy();
   res.redirect('/');
 
})

app.post('/signup', (req, res) => {
 
   var con = connect();
   
   var username = req.body.username;
   var password = req.body.password;
   var gender = req.body.gender;
   var date_created = null;
   var last_login = null;
   
   var sql = `INSERT INTO user (username, password, gender) VALUES (?, ?, ?)`;
   var values = [username, password, gender];

   con.query(sql, values, (err, result) => {
       if (err) {
           throw err;
       }
       console.log('User ', username, ' inserted into database');
       
       res.render('login.ejs');

   });
});

app.post('/user',(req,res) => {
   
   var con = connect();

   var requsername = req.body.username;
   var reqpassword = req.body.password;
   
   var sql = null
   var values = [username, password];

   con.connect(function(err) {
      if (err) throw err;
      con.query(sql, function (err, result, fields) {
         if (err) throw err;
         console.log(result);
      });
 
   });

   console.log(username, password)
   if(req.body.username == result.username && req.body.password == result.password){
       session.userid=req.body.username;
       console.log(req.session)
       res.render('index.ejs');
   }
   else{
       res.send('Invalid username or password');
   }
})

app.post('/login', function (req, res) {

   var con = connect();

   // hent brukernavn og passord fra skjema på login
   var username = req.body.username;
   var password = req.body.password;

   // perform the MySQL query to check if the user exists
   var sql = 'SELECT * FROM user WHERE username = ? AND password = ?';
   
   con.query(sql, [username, password], (error, result) => {
       if (error) {
           res.status(500).send('Internal Server Error');
       } else if (result.length === 1) {
           session=req.session;
           session.userid=req.body.username; // set session userid til brukernavn
           res.redirect('/');
           console.log(username, ' logged in');

       } else {
           res.redirect('/login?error=invalid'); // redirect med error beskjed i GET
       }
   });
})

app.get('/profile', function (req, res) {
   res.render('null', {     
   });

})

// app.get('/settings', function (req, res) {
//    res.render('settings.ejs');

//    var con = connect();
   
//    function delete_account() {
//       null;
//    }
//    let delete_account_button = document.querySelector('#delete-account')
//    delete_account_button.addEventListener("click", delete_account);
   
//    var session = session.req
//    var username = req.body.username;
//    var password = req.boddy.password;
   
//    var sql = `DELETE FROM users WHERE username='Alfreds Futterkiste';`;
//    var values = [username, password];

//    con.query(sql, values, (err, result) => {
//        if (err) {
//            throw err;
//        }
//        console.log('User ', username, ' inserted into database');
       
//        res.render('login.ejs');

//    });
// })

// tail
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})