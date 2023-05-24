app.get('/delete', function (req, res) {

    var con = connect();
 
    // Check if the user is signed in by verifying the session or any authentication mechanism you have in place
    if (req.session.userid) {
 
      var email = req.session.userid;
  
      // Perform the MySQL query to delete the user account
      var deleteSql = 'DELETE FROM member WHERE email = ?';
  
      con.query(deleteSql, [email], (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).send('Internal Server Error');
        } else {
          // Account deletion successful
          req.session.destroy(function (error) {
            if (error) {
              console.log(error);
            }
            res.redirect('/home');
          });
        }
      });
    } else {
      res.redirect('/login'); // Redirect to the login page if the user is not signed in
    }
});