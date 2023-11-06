const express = require('express');
const router = express.Router();
const Game = require("../models/gameModel");

router.post('/start', async function (req, res, next) {
    try {
        let result = Game.start_game(req.body.id);
        //! missing errors.
        res.status(200).send({msg: "success"});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
module.exports = router;