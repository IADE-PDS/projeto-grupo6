const express = require('express');
const router = express.Router();
const unityServer = require("../models/unityServerModel");
const utils = require("../config/utils");
const auth = require("../middleware/auth");
const tokenSize = 64;
// /api/lobby/general
router.get('/general',  async function (req, res, next) {
    try {
        console.log("Get all lobbies");
        let result = await unityServer.getAllLobbies();
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

module.exports = router;
