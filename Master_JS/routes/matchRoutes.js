const express = require('express');
const router = express.Router();
const matchModel = require("../models/matchModel");
const matchmaking = require("../models/matchmakingModel")
const utils = require("../config/utils");
const auth = require("../middleware/auth");
const tokenSize = 64;
// /api/lobby/general
router.get('/all',  async function (req, res, next) {
    try {
        console.log("Get all lobbies");
        let result = await matchModel.GetAllMatches();
        if (result.status != 200)
            res.status(result.status).send(result.result);
        else {
            let routes = result.result.map((rt)=> rt.export());
            res.status(200).send(routes);
            console.log(routes);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
//Update the game server
router.patch('/update', async function (req, res, next) {
    try {
        //! verify if the server password is correct
        //get updated information from a unity server
        //call app to save it
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
router.get('/matchmaking', async function (req, res, next) {
    try {
        let result = await matchmaking.SearchServer();
        console.log(result);
        res.status(200).send("routes");
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
module.exports = router;
