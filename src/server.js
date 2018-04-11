const express = require("express");
const root = require("./root");

const app = express();

let port = process.env.PORT;
if (port === undefined) {
  port = "5000";
}

app.get("/", root);

const listener = app.listen(port, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
