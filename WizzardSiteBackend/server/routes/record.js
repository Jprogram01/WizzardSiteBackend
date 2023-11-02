const hashing = require("../encryption")
const logic = require('../logic');
const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn.js");
const { ObjectId } = require('mongodb');
// This help convert the id from string to ObjectId for the _id.
 

 
// This section will help you get a single record by id
recordRoutes.route("/record/:id").get(async function (req, res) {
  try {
    let db_connect = dbo.getDb("Wizzard_Data");

    let myquery = { _id: new ObjectId(req.params.id) };
    
    const result = await db_connect.collection("Items").findOne(myquery);

    res.json(result);
  } catch (err) {
    console.error('Error in /record/:id route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
recordRoutes.route("/record").get(async function (req, res) {
  try {
    const db_connect = dbo.getDb("Wizzard_Data");

    if (!db_connect) {
      return res.status(500).json({ error: 'Internal Server Error - Database Connection Issue' });
    }

    const cursor = db_connect.collection("Items").find({});

    res.writeHead(200, { 'Content-Type': 'application/json' });

    // Using forEach with the cursor
    await cursor.forEach(doc => {
      res.write(JSON.stringify(doc));
    });

    res.end();

  } catch (err) {
    console.error('Error in /record route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// This section will help you create a new record.
recordRoutes.route("/record/addperson").post(async function (req, response) {
  try {
    let db_connect = dbo.getDb("Wizzard_Data");
    let myobj = {
      email: req.body.email,
      password: (await hashing.hashPassword(req.body.password)).toString(),
      name: req.body.name,
      coins: 1000
    };

    const result = await db_connect.collection("People").insertOne(myobj);

    response.json(result);

  } catch (err) {
    console.error('Error in /record/addperson route:', err);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});


recordRoutes.route("/updatecoins/:id").post(async function (req, res) {
  let db_connect = dbo.getDb("Wizzard_Data");

  try {
    let userId = req.params.id;

    let user = await db_connect.collection("People").findOne({ _id: new ObjectId(userId) });
    let currentCoins = user.coins;

    // Ensure that newcoins is a decimal value
    let newCoins = parseFloat(req.body.newcoins);

    // Update the coins using the logic function
    let updatedCoins = logic.updateCoins(currentCoins, newCoins);

    await db_connect.collection("People").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { coins: updatedCoins } }
    );

    // Respond with the updated value
    res.json({ updatedCoins });

  } catch (error) {
    console.error('Error in /updatecoins/:id route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
 
// This section will help you delete a record
recordRoutes.route("/:id").delete(async (req, response) => {
  try {
    let db_connect = dbo.getDb();
    let myquery = { _id: new ObjectId(req.params.id) };

    const result = await db_connect.collection("records").deleteOne(myquery);

    console.log("1 document deleted");
    response.json(result);

  } catch (err) {
    console.error('Error in /:id DELETE route:', err);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});


recordRoutes.route("/login").post(async function (req, response) {
  try {
    const db_connect = dbo.getDb("Wizzard_Data");
    const { email, password } = req.body;

    // Find the user by email
    const user = await db_connect.collection("People").findOne({ email });

    if (user) {
      // Compare the hashed password from the database with the provided password
      const isPasswordMatch = await hashing.comparePasswords(password, user.password);

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