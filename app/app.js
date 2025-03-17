// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

//Use the Pug templating engine 
app.set('view engine', 'pug');
app.set('views', './app/views');

// Create a route for root - /


// Home Page
app.get("/", (req, res) => {
    var sql = "SELECT * FROM Services";  // Ensure this matches your database table name

    db.query(sql).then(results => {
        res.render("index", { rides: results, services: results }); // Ensure services is passed
    }).catch(err => {
        console.error("Database Error:", err);
        res.render("index", { rides: [], services: [] }); // Pass an empty array if error occurs
    });
});



app.get("/all-rides", (req, res) => {
    db.query("SELECT r.*, t.name AS type_name FROM Rides r JOIN Type t ON r.type_id = t.id")
    .then(results => {
        res.render("all-rides", { rides: results });
    })
    .catch(err => {
        console.error(err);
        res.render("all-rides", { rides: [] });
    });
});


app.get("/single-ride/:id", (req, res) => {
    var rideId = req.params.id;
    var rideSql = `SELECT r.id, d.name AS driver, t.name AS ride_type, u.name AS user, 
                   r.pickup, r.dropoff, r.entertainment
                   FROM Rides r
                   JOIN Drivers d ON r.driver_id = d.id
                   JOIN Type t ON r.type_id = t.id
                   JOIN Users u ON r.user_id = u.id
                   WHERE r.id = ?`;

    db.query(rideSql, [rideId]).then(results => {
        if (results.length === 0) {
            return res.status(404).send("<h2 style='color: red;'>Ride not found</h2>");
        }
        res.render("single-ride", { ride: results[0] });
    }).catch(err => {
        console.error(err);
        res.status(500).send("<h2 style='color: red;'>Error fetching ride details</h2>");
    });
});


app.get("/all-drivers", (req, res) => {
    var sql = "SELECT * FROM Drivers";
    db.query(sql)
        .then(results => {
            res.render("all-drivers", { drivers: results });
        })
        .catch(err => {
            console.error("Database Error:", err);
            res.render("all-drivers", { drivers: [] });
        });
});



// About Page
app.get("/about", (req, res) => {
    res.render("about");
});

// Services Page
app.get("/services", (req, res) => {
    res.render("services");
});

// Contact Page
app.get("/contact", (req, res) => {
    res.render("contact");
});







// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results)
    });
});



// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});