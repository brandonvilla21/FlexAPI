const express = require('express');
const router = express.Router();
const PurchaseProduct = require('../models/purchaseProduct');

router
    .get('/', (req, res, next) => {
        PurchaseProduct.all( (error, data) => {
            return PurchaseProduct.response(res, error, data);
        });
    })

    .get('/:id', (req, res, next) => {
        PurchaseProduct.findById(req.params.id, (error, data) => {
            return PurchaseProduct.response(res, error, data);
        });
    })

    .get('/byColumn/:column/:param', (req, res, next) => {
        PurchaseProduct.findByParam( req.params.column, req.params.param, (error, data) => {
            return PurchaseProduct.response(res, error, data);
        });
      })

    // .post('/', (req, res, next) => {
    //     const purchaseProduct = {
    //         purchaseProduct_id: null,
    //         name: req.body.name,
    //         lastname: req.body.lastname,
    //         reference: req.body.reference,
    //         whatsapp: req.body.whatsapp,
    //         facebook: req.body.facebook,
    //         balance: req.body.balance,
    //     }
    //     PurchaseProduct.insert(purchaseProduct, (error, data) => {
    //         return PurchaseProduct.response(res, error, data);
    //     })
    // })

    // .put('/:id', (req, res, next) => {
    //     const purchaseProduct = {
    //         purchaseProduct_id: req.params.id,
    //         name: req.body.name,
    //         lastname: req.body.lastname,
    //         reference: req.body.reference,
    //         whatsapp: req.body.whatsapp,
    //         facebook: req.body.facebook,
    //         balance: req.body.balance
    //     }

    //     PurchaseProduct.update(purchaseProduct, (error, data) => {
    //         return PurchaseProduct.response(res, error, data);
    //     })
    // })

    // .delete('/:id', (req, res, next) => {
    //     PurchaseProduct.remove(req.params.id, (error, data) => {
    //         return PurchaseProduct.response(res, error, data);
    //     });
    // });
    
module.exports = router;