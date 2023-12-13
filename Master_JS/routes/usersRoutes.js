const express = require('express');
const router = express.Router();
const User = require("../models/usersModel");
const utils = require("../config/utils");
const auth = require("../middleware/auth");
const tokenSize = 64;


//register
router.post('', async function (req, res, next) {
    try {

        let user = req.body.user;
        let result = await User.Register(user);
        if (result.status != 200) {
            console.log("not making token");
            res.status(result.status).send(result.result.msg);
            return;
        }
        user.id = result.result.id;
        console.log(user);
        let token = utils.genToken(tokenSize);
        user.token = token;
        result = await User.SaveToken(user);
        res.status(result.status).send({msg: result.result.msg, token: token, username:user.username, id:user.id});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
//login
router.post('/login', async function (req, res, next) {
    try {
       let result = await User.Login(req.body.user);
       if (result.status != 200) {
            res.status(result.status).send(result.result.msg);
            return;
        }
         let user = result.result.user;
         let token = utils.genToken(tokenSize);
         user.token = token;
         let result1 = await User.SaveToken(user);
         res.status(200).send({msg: "Successful Login!", token:token, username:result.result.user.username, id:result.result.user.id});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
//authenthicate
router.post('/auth',auth.verifyAuth, async function (req, res, next) {
    try {
        res.status(200).send({msg: "Logged in"});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});
router.delete('/auth',auth.verifyAuth, async function (req, res, next) {
    try {
        let result = User.logout(req.user.id);
        console.log(result);
        res.status(200).send({msg: "Logged out"});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;