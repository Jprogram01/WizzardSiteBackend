const { MongoClient } = require("mongodb");
const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db);
var _db;
 
module.exports = {
  connectToServer: function (callback) {
    client.connect()
      .then((connection) => {
        _db = connection.db("Wizzard_Data");
        console.log("Successfully connected to MongoDB.");
        return callback(null);
      })
      .catch((err) => {
        console.log(err);
        return callback(err);
      });
  },

  getDb: function () {
    if (!_db) {
      console.error("Database not connected.");
    }
    return _db;
  },
};