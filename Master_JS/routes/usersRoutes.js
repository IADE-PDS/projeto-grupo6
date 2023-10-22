const express = require('express');
const router = express.Router();
const User = require("../models/usersModel");
const utils = require("../config/utils");
const auth = require("../middleware/auth");
const tokenSize = 64;



router.get('', async function (req, res, next) {
    try {

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
module.exports = router;