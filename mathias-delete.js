app.get('/delete', function (req, res) {
    var con = connect();
 
    // Check if the user is signed in by verifying the session or any authentication mechanism you have in place
    if (req.session.userid) {
        var email = req.session.userid;
 
        // Render a page with a form to enter the password
        res.render('delete-account', { email: email });
    } else {
        res.redirect('/login'); // Redirect to the login page if the user is not signed in
    }
});
 
// POST request to handle the password verification and delete the account
app.post('/delete', function (req, res) {
    var con = connect();
 
    // Check if the user is signed in by verifying the session or any authentication mechanism you have in place
    if (req.session.userid) {
        var email = req.session.userid;
        var password = req.body.password; // Assuming the password is sent in the request body
 
        // Perform the MySQL query to fetch the user's password from the database
        var selectSql = 'SELECT password FROM member WHERE email = ?';
 
        con.query(selectSql, [email], (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).send('Internal Server Error');
            } else {
                if (results.length > 0) {
                    var storedPassword = results[0].password; // Assuming the password is stored in the 'password' column
 
                    // Compare the entered password with the stored password
                    if (password === storedPassword) {
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
        res.redirect('/login'); // Redirect to the login page if the user is not signed in
    }
});