//here is the main server code
console.log("hello get some codes you want to weather predict");

var path = require("path");
var express = require("express");
var zipdb = require("zippity-do-dah");
// var ForecastIo = require("forecastio"); // <-- not needed if using Open-Meteo

var app = express();

app.use(express.static(path.resolve(__dirname, "public")));
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// Only one / route
app.get("/", function(req, res) {
  res.render("index");
});

// Zipcode route: /90210
app.get(/^\/(\d{5})$/, async (req, res) => {
  try {
    var zipcode = req.params[0];
    var location = zipdb.zipcode(zipcode);

    if (!location || !location.zipcode) {
      return res.status(404).render("404");
    }

    var lat = location.latitude;
    var lon = location.longitude;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`;

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`);

    const data = await response.json();
    res.json(data.current); // send only current data to your frontend

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 404 handler - must be last
app.use(function(req, res) {
  res.status(404).render("404");
});

app.listen(3000, () => console.log("server running at 3000"));


