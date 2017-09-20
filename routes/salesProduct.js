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

    .get('/general', (req, res, next) => {
        SaleProduct.general( (error, data) => {
            return SaleProduct.response(res, error, data);
        });
    })

    .get('/count', (req, res, next) => {
        SaleProduct.count( (error, data) => {
            return SaleProduct.response(res, error, data);
        });
    })

    .get('/byColumn/:column/:param', (req, res, next) => {
        SaleProduct.findByParam( req.params.column, req.params.param, (error, data) => {
            return SaleProduct.response(res, error, data);
        });
    })

    .get('/join/:id', (req, res, next) => {
        SaleProduct.findByIdJoin(req.params.id, (error, data) => {
            return SaleProduct.response(res, error, data);
        });
    })
    
    .get('/:id', (req, res, next) => {
        SaleProduct.findById(req.params.id, (error, data) => {
            return SaleProduct.response(res, error, data);
        });
    })

    .post('/', (req, res, next) => {
        const saleProduct = {
          sale_id: null,
          customer_id: req.body.customer_id,
          employee_id: req.body.employee_id,
          sale_date: req.body.sale_date,
          subtotal: req.body.subtotal,
          discount: req.body.discount,
          total: req.body.total,
          total_payment: req.body.total_payment             
        }

        let detailRows = [];
        let updateRows = [];
        async.each(req.body.product_saleProduct, (item, cb) => {
            detailRows.push(values( item ));
            updateRows.push({amount: item.amount, product_id: item.product_id});
            cb();
        }, (err) => {
            if(err){
                SaleProduct.response(err);
            } else {
                SaleProduct.insert(saleProduct, detailRows, updateRows, (error, data) => {
                    return SaleProduct.response(res, error, data);
                })   
            }
        })

    })

    // .put('/:id', (req, res, next) => {
    //     const saleProduct = {
    //         saleProduct_id: req.params.id,
    //         name: req.body.name,
    //         lastname: req.body.lastname,
    //         reference: req.body.reference,
    //         whatsapp: req.body.whatsapp,
    //         facebook: req.body.facebook,
    //         balance: req.body.balance
    //     }

    //     SaleProduct.update(saleProduct, (error, data) => {
    //         return SaleProduct.response(res, error, data);
    //     })
    // })

    // .delete('/:id', (req, res, next) => {
    //     SaleProduct.remove(req.params.id, (error, data) => {
    //         return SaleProduct.response(res, error, data);
    //     });
    // });
    
module.exports = router;