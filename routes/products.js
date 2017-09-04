const express = require('express');
const router = express.Router();
const Product = require("../models/product");

router 
    .get('/', (req, res, next) => {
        Product.all((error, data) => {
            return Product.response(res, error, data);
        });
    });
module.exports = router;