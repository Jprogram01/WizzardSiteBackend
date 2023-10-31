const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(require("./routes/record"));
const fetch = require('node-fetch'); 
var request = require('request')
// get driver connection
const dbo = require("./db/conn.js");



app.listen(port, () => {
  
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
   });
  console.log(`Server is running on port: ${port}`);
});


fetch('http://localhost:5000/record')
  .then(response => response.json())
  .then(data => {
    // Handle the data from the response
    console.log('Data from the server:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
