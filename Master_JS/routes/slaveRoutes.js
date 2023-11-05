const express = require('express');
const router = express.Router();
const Slave = require("../models/slaveModel");
const utils = require("../config/utils");
const auth = require("../middleware/auth");
const tokenSize = 64;


//register the slave in the database
router.post('/register', async function (req, res, next) {
    try {
        //req recieves the ip of the owner + a secret key and call function on childModel that will insert the slave to the db
        let result = await Slave.RegisterChild(req.body);
        res.status(result.status).send({msg: result.result.msg});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});

router.delete('/delete', async function (req, res, next) {
    try {
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
//creating a game server 
router.post('/startGame', async function (req, res, next) {
    try {
        //!each unity server need to have its own Password 
        //verify if the create function has some kinda of parametre like "crashed or something"
        //if the creating server is being created because of a crashed server we need another 
        //https request outgoing to the slave to create a game server
        //if successfull save the server unity and match into the database
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
//Update the game server
router.patch('/updateGame', async function (req, res, next) {
    try {
        //! verify if the server password is correct
        //get updated information from a unity server
        //call app to save it
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
module.exports = router;