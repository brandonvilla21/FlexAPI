const express = require('express');
const router = express.Router();
const Product = require("../models/product");

router 
    .get('/', (req, res, next) => {
        Product.all((error, data) => {
            return Product.response(res, error, data);
        });
    })

    .get('/:id', (req, res, next) => {
        Product.findById( req.params.id, (error, data) => {
            return Product.response(res, error, data);
        });
    })
    
    .get('/description/:id', (req, res, next) => {
      Product.findByDescription( req.params.id, (error, data) => {
          return Product.response(res, error, data);
      });
    })

    .post('/', (req, res, next) => {
        const product = {
            product_id: null,
            description: req.body.description,
            brand: req.body.brand,
            flavor: req.body.flavor,
            expiration_date: req.body.expiration_date,
            sale_price: req.body.sale_price,
            buy_price: req.body.buy_price,
            existence: req.body.existence,
            max: req.body.max,
            min: req.body.min
        };
        Product.insert(product, (err, data) => {
            return Product.response(res, err, data);
        });
    })

    .put('/:id', (req, res, next) => {
        const product = {
            product_id: req.params.id,
            description: req.body.description,
            brand: req.body.brand,
            flavor: req.body.flavor,
            expiration_date: req.body.expiration_date,
            sale_price: req.body.sale_price,
            buy_price: req.body.buy_price,
            existence: req.body.existence,
            max: req.body.max,
            min: req.body.min
        }

        Product.update(product, (error, data) => {
            return Product.response(res, error, data);
        })
    })

    .delete('/:id', (req, res, next) => {
        Product.remove(req.params.id, (err, data) => {
            return Product.response(res, err, data);
        });
    });
module.exports = router;