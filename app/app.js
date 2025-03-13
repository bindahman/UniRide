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
app.get("/", function(req, res) {
    res.render("index");    
});

app.get("/all-drivers", function(req, res) {
    var sql = 'SELECT * FROM Drivers';
    db.query(sql).then(results => {
        console.log(results);
        res.json(results);
    });
}); 

//formated uniride one 
app.get("/all-drivers-form", function(req, res) {
    var sql = 'SELECT * FROM Drivers';

    var output = '<table border=lpx">';

    db.query(sql).then(results => {
    for (var row of results) {
        output += '<tr>'
        output += '<td>'+ row.id; '</td>' ;
        output += '<td>'+ '<a href="./single-driver/' + row.id + '">' + row.name + '</a>' + '</td>';
        output+= '</tr>' 
    }
    output+= '<table>'
    res.send(output);
 });

});

//gpt chat

app.get("/single-ride/:id", function(req, res) {
    var rideId = req.params.id;
    console.log(rideId);

    var rideSql = `
        SELECT r.id, d.name AS driver, t.name AS ride_type, u.name AS user, 
               r.pickup, r.dropoff, r.entertainment
        FROM Rides r
        JOIN Drivers d ON r.driver_id = d.id
        JOIN Type t ON r.type_id = t.id
        JOIN Users u ON r.user_id = u.id
        WHERE r.id = ?`;

    db.query(rideSql, [rideId]).then(results => {
        if (results.length === 0) {
            res.send("<h2 style='color: red;'>No ride found with ID: " + rideId + "</h2>");
            return;
        }

        var output = `
            <html>
            <head>
                <title>Ride Details</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .container {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        max-width: 400px;
                        width: 100%;
                        text-align: center;
                    }
                    h2 {
                        color: #2c3e50;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    th, td {
                        padding: 10px;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background: #3498db;
                        color: white;
                    }
                    tr:hover {
                        background-color: #f1f1f1;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Ride Details</h2>
                    <table>
                        <tr><th>Ride ID</th><td>${results[0].id}</td></tr>
                        <tr><th>Driver</th><td>${results[0].driver}</td></tr>
                        <tr><th>User</th><td>${results[0].user}</td></tr>
                        <tr><th>Ride Type</th><td>${results[0].ride_type}</td></tr>
                        <tr><th>Pickup</th><td>${results[0].pickup}</td></tr>
                        <tr><th>Dropoff</th><td>${results[0].dropoff}</td></tr>
                        <tr><th>Entertainment</th><td>${results[0].entertainment}</td></tr>
                    </table>
                </div>
            </body>
            </html>
        `;

        res.send(output);
    }).catch(err => {
        console.error(err);
        res.send("<h2 style='color: red;'>Error fetching ride details.</h2>");
    });
});


app.get("/all-rides-form", function(req, res) {
    var sql = 'SELECT * FROM Rides';
    var output = '<table border="1px">';
    output += '<tr><th>Ride ID</th><th>Pickup</th><th>Dropoff</th><th>Entertainment</th><th>Type</th></tr>';

    db.query(sql).then(results => {
        for (var row of results) {
            output += '<tr>';
            output += '<td><a href="./single-ride/' + row.id + '">' + row.id + '</a></td>';
            output += '<td>' + row.pickup + '</td>';
            output += '<td>' + row.dropoff + '</td>';
            output += '<td>' + row.entertainment + '</td>';
            output += '<td>' + row.type_id + '</td>';
            output += '</tr>';
        }
        output += '</table>';
        res.send(output);
    });
});







 
    
    




app.get("/roehampton", function(req, res) {
    res.send("Hello roehampton!");
});
app.get("/admin", function(req, res) {
    res.send("Hello admin!");
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

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
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