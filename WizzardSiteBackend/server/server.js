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



dbo.connectToServer(function (err) {
  if (err) {
    console.error('Failed to connect to the database:', err);
    process.exit(1); // Exit the process if the database connection fails
  }

  // Start the server only if the database connection is successful
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
});
