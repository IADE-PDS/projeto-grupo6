const express = require('express');
const router = express.Router();
const Game = require("../models/gameModel");

router.post('/start', async function (req, res, next) {
    try {
 
        res.status(result.status).send({msg: result.result.msg, token: token});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
module.exports = router;