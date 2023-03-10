var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer  = require('multer');

app.use(express.static('public'));

app.get('/express', function (req, res) {
   res.send('Request for express');
})
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})
app.get('/about', function (req, res) {
   res.sendFile( __dirname + "/" + "about.html" );
})
app.get('/login', function (req, res) {
   res.sendFile( __dirname + "/" + "login.html" );
})
app.get('/process_get', function (req, res) {
   // Prepare output in JSON format
   response = {
      username:req.query.username,
      password:req.query.password
   };
   console.log(response);
   res.end(JSON.stringify(response));
})
app.get('/file-upload', function (req, res) {
   res.sendFile( __dirname + "/" + "file-upload.html" );
})
app.post('/file_upload', function (req, res) {
   console.log(req.files.file.name);
   console.log(req.files.file.path);
   console.log(req.files.file.type);
   var file = __dirname + "/" + req.files.file.name;
   
   fs.readFile( req.files.file.path, function (err, data) {
      fs.writeFile(file, data, function (err) {
         if( err ) {
            console.log( err );
            } else {
               response = {
                  message:'File uploaded successfully',
                  filename:req.files.file.name
               };
            }
         
         console.log( response );
         res.end( JSON.stringify( response ) );
      });
   });
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})