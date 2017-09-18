const express = require('express');
const router = express.Router();
const PurchaseProduct = require('../models/purchaseProduct');
const values = require('object.values');
const async = require('async');


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

    .post('/', (req, res, next) => {
        const purchaseProduct = {
            purchase_id: null,
            provider_id: req.body.provider_id,
            purchase_date: req.body.purchase_date,
            subtotal: req.body.subtotal,
            discount: req.body.discount,
            total: req.body.total            
        }

        let detailRows = [];
        let updateAmount = [];
        async.each(req.body.product_purchaseProduct, (item, cb) => {
            detailRows.push(values( item ));
            updateAmount.push({amount: item.amount, product_id: item.product_id});
            cb();
        }, (err) => {
            if(err){
                PurchaseProduct.response(err);
            } else {
                PurchaseProduct.insert(purchaseProduct, detailRows, updateAmount, (error, data) => {
                    return PurchaseProduct.response(res, error, data);
                })   
            }
        })

    })

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