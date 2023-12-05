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
// params: item ID
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

//Get all items
//params: None
recordRoutes.route("/record").get(async function (req, res) {
  try {
    const db_connect = dbo.getDb("Wizzard_Data");

    if (!db_connect) {
      return res.status(500).json({ error: 'Internal Server Error - Database Connection Issue' });
    }

    const cursor = db_connect.collection("Items").find({});

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write('[');  // Add an opening square bracket

    let first = true;

    // Using forEach with the cursor
    await cursor.forEach(doc => {
      // Add a comma before writing subsequent objects (except for the first one)
      if (!first) {
        res.write(',');
      }

      res.write(JSON.stringify(doc));
      first = false;
    });

    res.write(']');  // Add a closing square bracket
    res.end();

  } catch (err) {
    console.error('Error in /record route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// This section will help you create a new record.
// params: email, name, password
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
/*
This section will an item to a cart by ID
params: Item ID
*/
recordRoutes.route("/additemtocart/:id").post(async function (req, response) {
  try {
    let db_connect = dbo.getDb("Wizzard_Data");
    let myquery = { _id: new ObjectId(req.params.id) };
    let item = await db_connect.collection("Items").findOne(myquery);
    let user = await db_connect.collection("Shopping Carts").findOne({ _id: new ObjectId("65263aad4b8bc25d2093764b") });
    let currentCart = user.shopping_cart_items

    currentCart.push(item)

    await db_connect.collection("Shopping Carts").updateOne(
      { _id: new ObjectId("65263aad4b8bc25d2093764b") },
      { $set: { shopping_cart_items: currentCart } }
    );

    response.json(item.Item + " " + "Added");
  } catch (err) {
    console.error('Error in /record/additemtocart route:', err);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});


/*
This cart will get all items out of the shopping cart
params: None
*/
recordRoutes.route("/getcartitems").get(async function (req, response) {
  try {
    let db_connect = dbo.getDb("Wizzard_Data");
    let shoppingCart = await db_connect.collection("Shopping Carts").findOne({ _id: new ObjectId("65263aad4b8bc25d2093764b") });
    let currentCart = shoppingCart.shopping_cart_items

    response.json(currentCart);
  } catch (err) {
    console.error('Error in getcartitems route:', err);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});
/*
This will clear and individual item out of the cart by ID
params: Item ID
*/
recordRoutes.route("/clearcartitem/:id").post(async function (req, response) {
  try {
    let db_connect = dbo.getDb("Wizzard_Data");
    let shoppingCart = await db_connect.collection("Shopping Carts").findOne({ _id: new ObjectId("65263aad4b8bc25d2093764b") });
    let currentCart = shoppingCart.shopping_cart_items
    currentCart = currentCart.filter(item => item._id.toString() !== req.params.id);

    await db_connect.collection("Shopping Carts").updateOne(
      { _id: new ObjectId("65263aad4b8bc25d2093764b") },
      { $set: { shopping_cart_items: currentCart } });

    response.json(currentCart);
  } catch (err) {
    console.error('Error in /clearcartitem route:', err);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

/*
This will clear and individual item out of the cart by ID
params: None
*/
recordRoutes.route("/getperson").get(async function (req, response) {
  try {
    let db_connect = dbo.getDb("Wizzard_Data");
    let person = await db_connect.collection("People").findOne({ _id: new ObjectId("654350dab19fdd08891f89cf") });

    response.json(person);
  } catch (err) {
    console.error('Error in /clearcartitem route:', err);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

/*
This clears out all items from the cart
params: None
*/
recordRoutes.route("/clearallcartitems").post(async function (req, response) {
  try {
    let db_connect = dbo.getDb("Wizzard_Data");
        await db_connect.collection("Shopping Carts").updateOne(
      { _id: new ObjectId("65263aad4b8bc25d2093764b") },
      { $set: { shopping_cart_items: [] } }
    );

    response.json("items deleted");
  } catch (err) {
    console.error('Error in /record/additemtocart route:', err);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});
/*
This gets the price of all items in the cart, then clears out the cart.
params: None
*/
recordRoutes.route("/gettotalprice").get(async function (req, response) {
  try {
    const db_connect = dbo.getDb("Wizzard_Data");
    const shoppingCart = await db_connect.collection("Shopping Carts").findOne({ _id: new ObjectId("65263aad4b8bc25d2093764b") });
    let currentCart = shoppingCart.shopping_cart_items;

    // Calculate the total price using the reduce method
    let totalPrice = currentCart.reduce((sum, item) => sum + item.Price, 0);
    console.log(totalPrice)
    await db_connect.collection("Shopping Carts").updateOne(
      { _id: new ObjectId("65263aad4b8bc25d2093764b") },
      { $set: { shopping_cart_items: [] } }
    );

    response.json(totalPrice);
  } catch (err) {
    console.error('Error in /gettotalprice route:', err);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

/*
Updates the amount of coins the user has
params, person ID
*/
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
// params: item ID
recordRoutes.route("/deleteitem/:id").delete(async (req, response) => {
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

/*
Login functionality for login page
params: email, password
*/
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