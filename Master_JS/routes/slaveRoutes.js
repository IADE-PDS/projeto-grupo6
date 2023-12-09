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
        let ip = req._remoteAddress.split(":")[3]
        console.trace(ip);
        let result = await Slave.RegisterChild(req.body, ip);
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
module.exports = router;
