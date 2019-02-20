'use strict';
// load dotenv to manage variables
require('dotenv').config();

// Load App Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

// Setup Apps
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Tell express where to load our "html" files from
app.use(express.static('./public'));


// Create routes (paths) that the user can access the server from
// ----API routes-------

// Google GeoLocation route
app.get('/location', (request, response) => {
  searchtoLatLong(request.query.data)
    .then(location => response.send(location))
});

// Dark Sky route
app.get('/weather', getWeather);

// Yelp food review route

// Meetup route

// TODO:
// put a meetups route here

// MovieDB route

// Hiking route

// Error route
app.use('*', (request, response) => {
  response.send(handleError());
});

// Turn the server on
app.listen(PORT, () => console.log(`Listening on ${PORT}`));


//---Helper Function---//

// Constructs location object from API response
function Location(query, res) {
  console.log('res in Location()', res);
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

// Constructs the DarkSky object
function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

// Constructs the Meetup object
// TODO:
// function Meetup() {
  //  Code goes here...
// }

// Geocode Lookup Handler
function searchtoLatLong(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GOECODE_API_KEY}`;

  return superagent.get(url)
    .then(res => {
      return new Location(query, res);
    })
    .catch(error => handleError(error));
}

// Weather Route Handler
function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  superagent.get(url)
    .then(result => {
      const weatherSummaries = result.body.daily.data.map(day => {
        return new Weather(day);
      });

      response.send(weatherSummaries);
    })
    .catch(error => handleError(error, response));
}

// TODO:
// Meetup Route Handler
// function getMeetup() {
  // Code goes here...
// }

//Error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went worng');
}


