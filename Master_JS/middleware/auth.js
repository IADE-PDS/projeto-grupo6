const User = require("../models/usersModel");
// The correct value depends maxAge of the cookie (see index.js)
const refreshPer =  1440e3; // 1440e3 milliseconds = 1 hour

module.exports.verifyAuth = async function (req, res, next) {
    try {
        let token = req.body.token;
        if (!token) {
            res.status(401).send({ msg: "Please log in." });
            return;
        }
        let result = await User.getUserByToken(token);
        if (result.status != 200) {
            res.status(401).send({ msg: "Please log in." });
            return;
        }
        req.user = result.result.user;
        next();
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
} 