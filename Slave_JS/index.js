/*
use this to get own ip address

  var os = require('os');
  var networkInterfaces = os.networkInterfaces();
  console.log(networkInterfaces)
*/



















require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieSession = require('cookie-session');
var morgan = require('morgan');
const db = require("./config/database");

var app = express();

app.use(cookieSession({
  name: 'session',
  secret: "process.env.COOKIE_SECRET",
  maxAge: 6 * 60 * 60 * 1000 // 6 hours
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


const usersRouter = require("./routes/usersRoutes");
app.use("/api/users",usersRouter);



app.use((req, res, next) => {
  res.status(404).send({msg:"No resource or page found."});
})
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send(err);
})

const port = parseInt(process.env.port || '8080');
(async () => {
  await db.init();
  app.listen(port,function() {
    console.log("Server running at http://localhost:"+port);
  });
})();
