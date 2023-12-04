const express = require('express');
const router = express.Router();
const matchModel = require("../models/matchModel");
const matchmaking = require("../models/matchmakingModel")
const utils = require("../config/utils");
const auth = require("../middleware/auth");
const tokenSize = 64;
// /api/match
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
router.get('/matchmaking',auth.verifyAuth, async function (req, res, next) {
    try {
        console.log("matchmaking");
        let result = await matchmaking.SearchServer();
        res.status(result.status).send(result.result.server);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
//get server by id
router.get('/:matchid',  async function (req, res, next) {
    try {
        let result = await matchModel.GetMatchById(req.params.matchid);
        if (result.status != 200)
            res.status(result.status).send(result.result);
        else {
            console.log(result);
            res.status(200).send(result.result);
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
        let result = await matchModel.UpdateServer(req.body);
        console.log(result);
        if (result.status != 200){
           res.status(result.status).send(result.msg);
        }else{
         res.status(200).send(result.msg);
        }
        
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});

router.delete('/server', async function (req, res, next) {
    try {
        console.log("deleting");
        let result = await matchModel.closeMatch(req.body.matchid);
        res.status(result.status).send(result.result);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});


module.exports = router;
