const express = require('express');
const router = express.Router();
const User = require("../models/usersModel");
const utils = require("../config/utils");
const auth = require("../middleware/auth");
const tokenSize = 64;



router.post('', async function (req, res, next) {
    try {
        let user = req.body.user;
        let result = await User.Register(user);
        if (result.status != 200) {
            console.log("not making token");
            res.status(result.status).send(result.result.msg);
            return;
        }
        let token = utils.genToken(tokenSize);
        user.token = token;
        result = await User.SaveToken(user);
        res.status(result.status).send({msg: result.result.msg, token: token});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
router.get('/auth', async function (req, res, next) {
    try {
       let result = await User.Login(req.body.user);
       if (result.status != 200) {
            res.status(result.status).send(result.result.msg);
            return;
        }
         let user = result.result.user;
         let token = utils.genToken(tokenSize);
         user.token = token;
         result = await User.SaveToken(user);
         res.status(200).send({msg: "Successful Login!", token:token});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
module.exports = router;