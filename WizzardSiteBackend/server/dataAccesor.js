const dbo = require("./db/conn.js");
app.listen(port, () => {
  
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
   });
  console.log(`Server is running on port: ${port}`);
});

