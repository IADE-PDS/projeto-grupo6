const express = require('express');
const router = express.Router();
const matchModel = require("../models/matchModel");
const matchmaking = require("../models/matchmakingModel")
const utils = require("../config/utils");
const auth = require("../middleware/auth");
const tokenSize = 64;
//USER
router.get('/all',auth.verifyAuth,  async function (req, res, next) {
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
        let result = await matchmaking.SearchServer(req.user.id);
        res.status(result.status).send(result.result.server);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});

//SERVER
router.post('/authenthicateUser',auth.GameSerververifyAuth, async function (req, res, next) {
    try {
        console.log(req.body.id)
        let result = await matchModel.AuthethicatePlayer(req.body.id, req.match._id);
        if(result.status != 200){
            res.status(result.status).send(result.msg);
        }else{
        res.status(result.status).send(result.result);}
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});

router.get('/',auth.GameSerververifyAuth, async function (req, res, next) {
    try {
        res.status(200).send({result:{match:req.match}});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
//Update the game server
router.patch('/update', auth.GameSerververifyAuth, async function (req, res, next) {
    try {
        let result = await matchModel.UpdateServer(req.match._id, req.body.updates);
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

router.delete('/server',auth.GameSerververifyAuth, async function (req, res, next) {
    try {
        console.log("deleting");
        //let result = await matchModel.closeMatch(req.match._id);
        //res.status(result.status).send(result.result);
        res.status(200);

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});


module.exports = router;
