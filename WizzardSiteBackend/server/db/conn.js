const { MongoClient } = require("mongodb");
const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db);
console.log(process.env.ATLAS_URI);
var _db;
 
module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      if (err) {
      
        console.error('Error connecting to MongoDB:', err);
        return callback(err);
      }
      // Verify we got a good "db" object
      if (db)
      {
        _db = db.db("Wizzard_Data");
        console.log("Successfully connected to MongoDB."); 
      }
      return callback(null);
         });
  },
 
  getDb: function () {
    return _db;
  },
};