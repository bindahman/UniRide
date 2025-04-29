const axios = require('axios');


// Import express.js
const express = require("express");



// Create express app.h
var app = express();

// Add static files location .
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

//Use the Pug templating engine 
app.set('view engine', 'pug');
app.set('views', './app/views');

// Create a route for root - /

//APi
app.post("/weather", express.urlencoded({ extended: true }), async (req, res) => {
    const city = req.body.city;
    const apiKey = "40a1e811b4cdb2824e33b66ecb5e4696";
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        const weather = {
            temp: response.data.main.temp,
            description: response.data.weather[0].description,
            city: response.data.name
        };

        // Re-render the index.pug page with weather data
        res.render("index", { weather, services: [] }); // Pass services if you have them
    } catch (error) {
        let weatherError = "Invalid city name. Please try again.";
        res.render("index", { weatherError, services: [] });
    }
});

  

// Home Page for website
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
    var sql = 'SELECT * FROM Drivers';
    db.query(sql).then(results => {
        // Add fake static ratings manually (for demo purposes)
        const driversWithRatings = results.map((driver, index) => {
            const ratings = ['\u2B50\u2B50\u2B50\u2B50\u2B50', // ⭐⭐⭐⭐⭐
                '\u2B50\u2B50\u2B50\u2B50',      // ⭐⭐⭐⭐
                '\u2B50\u2B50\u2B50',            // ⭐⭐⭐
                '\u2B50\u2B50\u2B50\u2B50\u2B50',
                '\u2B50\u2B50\u2B50'];
           driver.rating = ratings[index % ratings.length]; // Rotate ratings
            return driver;
        });
        res.render("all-drivers", { drivers: driversWithRatings });
    });
});


app.get("/single-driver/:id", (req, res) => {
    var driverId = req.params.id;
    var sql = `SELECT id, name FROM Drivers WHERE id = ?`;

    db.query(sql, [driverId]).then(results => {
        if (results.length > 0) {
            res.render("single-driver", { driver: results[0] });
        } else {
            res.send("<h2 style='color: red;'>Driver not found.</h2>");
        }
    }).catch(err => {
        console.error(err);
        res.send("<h2 style='color: red;'>Error retrieving driver details.</h2>");
    });
});

//RatingDriver
app.post("/rate-driver/:id", express.urlencoded({ extended: true }), (req, res) => {
    const driverId = req.params.id;
    const rating = parseInt(req.body.rating);

    const insertSql = `INSERT INTO Ratings (driver_id, rating) VALUES (?, ?)`;
    db.query(insertSql, [driverId, rating]).then(() => {
        res.redirect("/single-driver/" + driverId);
    });
});


  

// About Page for website            
app.get("/about", (req, res) => {
    res.render("about");
});

// Services Page for website
app.get("/services", (req, res) => {
    res.render("services");
});

// Contact Page for website
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

//message
app.post("/send-message", express.urlencoded({ extended: true }), (req, res) => {
    const { name, email, message } = req.body;
  
    // You can store this in a database or send via email
    console.log("Message received:", { name, email, message });
  
    // Simple feedback
    res.send(`<h2>Thank you, ${name}! Your message has been received.</h2>
              <p><a href="/">Go back to homepage</a></p>`);
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
