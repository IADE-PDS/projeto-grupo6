const express = require('express');
const router = express.Router();
const Product = require("../models/productsModel");


// Get shoplists of the authenticated user
router.get('',  async function (req, res, next) {
    try {
        console.log("Get all products");
        let result = await Product.getProducts();
        res.status(result.status).send(result.result);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


module.exports = router;
