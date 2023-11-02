require('dotenv').config();
var express = require('express');
var path = require('path');
var morgan = require('morgan');
const db = require("./config/database");

var app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


const usersRouter = require("./routes/usersRoutes");
app.use("/api/users",usersRouter);
const matchRouter = require("./routes/matchRoutes");
app.use("/api/match",matchRouter);

const slaveRouter = require("./routes/slaveRoutes");
app.use("/api/slave",slaveRouter);


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
