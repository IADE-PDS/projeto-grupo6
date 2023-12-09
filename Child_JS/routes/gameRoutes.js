const express = require('express');
const router = express.Router();
const Game = require("../models/gameModel");

router.post('/start', async function (req, res, next) {
    try {
        let result = await Game.start_game(req.body.token);
        res.status(result.status).send(result.result);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
router.delete('/stop/:id', async function (req, res, next) {
    try {
        let result = await Game.close_game(req.params.id);
        res.status(result.status).send(result.result);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
module.exports = router;