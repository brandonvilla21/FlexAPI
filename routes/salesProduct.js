const express = require('express');
const router = express.Router();
const SaleProduct = require('../models/saleProduct');
const values = require('object.values');
const async = require('async');


router
    .get('/', (req, res, next) => {
        SaleProduct.all( (error, data) => {
            return SaleProduct.response(res, error, data);
        });
    })

    .get('/:id', (req, res, next) => {
        SaleProduct.findById(req.params.id, (error, data) => {
            return SaleProduct.response(res, error, data);
        });
    })

    .get('/byColumn/:column/:param', (req, res, next) => {
        SaleProduct.findByParam( req.params.column, req.params.param, (error, data) => {
            return SaleProduct.response(res, error, data);
        });
      })

    // .post('/', (req, res, next) => {
    //     const purchaseProduct = {
    //         purchase_id: null,
    //         provider_id: req.body.provider_id,
    //         purchase_date: req.body.purchase_date,
    //         subtotal: req.body.subtotal,
    //         discount: req.body.discount,
    //         total: req.body.total            
    //     }

    //     let detailRows = [];
    //     async.each(req.body.product_purchaseProduct, (item, cb) => {
    //         detailRows.push(values( item ));
    //         cb();
    //     }, (err) => {
    //         if(err){
    //             SaleProduct.response(err);
    //         } else {
    //             SaleProduct.insert(purchaseProduct, detailRows, (error, data) => {
    //                 return SaleProduct.response(res, error, data);
    //             })   
    //         }
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

    //     SaleProduct.update(purchaseProduct, (error, data) => {
    //         return SaleProduct.response(res, error, data);
    //     })
    // })

    // .delete('/:id', (req, res, next) => {
    //     SaleProduct.remove(req.params.id, (error, data) => {
    //         return SaleProduct.response(res, error, data);
    //     });
    // });
    
module.exports = router;