const express = require('express');
const router = express.Router();
const ShopList = require("../models/shoplistsModel");
const auth = require("../middleware/auth");

// Get shoplists of the authenticated user
router.get('/auth',auth.verifyAuth,  async function (req, res, next) {
    try {
        console.log("Get shoplists of the authenticated user");
        let result = await ShopList.getUserShoplists(req.user.id);
        if (result.status != 200)
            res.status(result.status).send(result.result);
        else {
            let shoplists = result.result.map((sl)=> sl.export());
            res.status(200).send(shoplists);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Get a shoplist of the authenticated user
router.get('/auth/:id',auth.verifyAuth,  async function (req, res, next) {
    try {
        console.log("Get a shoplist of the authenticated user");
        let result = await ShopList.getUserShoplist(req.user.id,req.params.id);
        if (result.status != 200)
            res.status(result.status).send(result.result);
        else {
            res.status(200).send(result.result);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


router.post('/auth/:id/items',auth.verifyAuth,  async function (req, res, next) {
    try {
        console.log("Add item to a shoplist of the authenticated user");
        let result = await ShopList.addItem(req.user.id,req.params.id,
                                            req.body.prodId,
                                            req.body.unitId, req.body.quant);
        if (result.status != 200)
            res.status(result.status).send(result.result);
        else {
            res.status(200).send(result.result);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});





module.exports = router;