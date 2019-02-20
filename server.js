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
app.get('/meetups', getMeetup);

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
  this.formattedj_query = res.body.results[0].formatted_address;
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
function Meetup(meetup) {
  this.link = meetup.link;
  this.name = meetup.name;
  this.host = meetup.group.name;
  this.creation_date = new Date(meetup.created).toString().slice(0, 15);
}

// Geocode Lookup Handler
function searchtoLatLong(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

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

// Meetup Route Handler
function getMeetup(request, response) {
  const url = `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&key=${process.env.MEETUP_API_KEY}&lon=${request.query.data.longitude}&lat=${request.query.data.latitude}`
  console.log('url', url);
  superagent.get(url)
    .then(result => {
      const meetupSummaries = result.body.events.map(meetup => {
        const event = new Meetup(meetup);
        return event;
      });

      response.send(meetupSummaries);
    })
    .catch(error => handleError(error, response))
}

//Error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went worng');
}


