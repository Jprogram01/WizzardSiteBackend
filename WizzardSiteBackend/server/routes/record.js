const {hashPassword, comparePasswords} = require("./encryption")

const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn.js");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
 
// This section will help you get a list of all the records.
recordRoutes.route("/record").get(function (req, res) {
 let db_connect = dbo.getDb("Wizzard_Data");
 db_connect
   .collection("items")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// This section will help you get a single record by id
recordRoutes.route("/record/:id").get(function (req, res) {
 let db_connect = dbo.getDb("Wizzard_Data");
 let myquery = { _id: ObjectId(req.params.id) };
 db_connect
   .collection("records")
   .findOne(myquery, function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// This section will help you create a new record.
recordRoutes.route("/record/addperson").post(function (req, response) {
 let db_connect = dbo.getDb("Wizzard_Data");
 let myobj = {
   email: req.body.email,
   password: hashPassword(req.body.password),
   name: req.body.name,
   coins: 1000
 };
 db_connect.collection("People").insertOne(myobj, function (err, res) {
   if (err) throw err;
   response.json(res);
 });
});

 
// This section will help you update a record by id.
recordRoutes.route("/updatecoins/:id").post(function (req, response) {
 let db_connect = dbo.getDb("Wizzard_Data");
 let newcoins = req.body.newcoins
 let myquery = { _id: ObjectId(req.params.id) };
 let newvalues = {
   $inc: {coins: newcoins}
 };
 db_connect
   .collection("People")
   .updateOne(myquery, newvalues, function (err, res) {
     if (err) throw err;
     console.log("1 document updated");
     response.json(res);
   });
});
 
// This section will help you delete a record
recordRoutes.route("/:id").delete((req, response) => {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 db_connect.collection("records").deleteOne(myquery, function (err, obj) {
   if (err) throw err;
   console.log("1 document deleted");
   response.json(obj);
 });
});

// loginController.js
const { ObjectId } = require('mongodb');
const comparePasswords = require('./passwordUtils'); // Adjust the path based on your project structure

recordRoutes.route("/login").post(async function (req, response) {
  try {
    const db_connect = dbo.getDb("Wizzard_Data");
    const { username, password } = req.body;

    const user = await db_connect.collection("People").findOne({ username });

    if (user) {
      // Compare the hashed password from the database with the provided password
      const isPasswordMatch = await comparePasswords(password, user.password);

      if (isPasswordMatch) {
        // Login successful
        response.json({ success: true, message: "Login successful" });
      } else {
        // Password doesn't match
        response.json({ success: false, message: "Invalid password" });
      }
    } else {
      // User not found
      response.json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});






 
module.exports = recordRoutes;