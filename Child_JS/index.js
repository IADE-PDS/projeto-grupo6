
//use this to get own ip address

require('dotenv').config();
var express = require('express');
var path = require('path');
var morgan = require('morgan');
var register = require("./middleware/register")
var app = express();


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


const usersRouter = require("./routes/usersRoutes");
app.use("/api/users",usersRouter);

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send(err);
})
register.register();
const port = parseInt(process.env.port || '8081');
app.listen(port,function() {
  console.log("Server running at http://localhost:"+port);
});


