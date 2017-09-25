const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');
const values = require('object.values');
const async = require('async');

router
    .get('/', (req, res, next) =>{
        Payment.all( ( error, data ) =>{
            return Payment.response( res, error, data );
        })
    })
    .get('/general', (req, res, next) =>{
        Payment.general( ( error, data ) =>{
            return Payment.response( res, error, data );
        })
    })

    .get('/join/:id', (req, res, next) =>{
        Payment.findByIdJoin(req.params.id, ( error, data ) =>{
            return Payment.response( res, error, data );
        })
    })

    .get('/count', (req, res, next) =>{
        Payment.count( ( error, data ) =>{
            return Payment.response( res, error, data );
        })
    })

    .get('/:id', (req, res, next) =>{
        Payment.findById(req.params.id, ( error, data ) => {
            return Payment.response( res, error, data );
        })
    })

    .post('/', (req, res, next) => {
        const payment = {
            payment_id: null,
            sale_id: req.body.sale_id,
            employee_id: req.body.employee_id,
            payment_amount: req.body.payment_amount,
            payment_date: req.body.payment_date
        }

        Payment.insert(payment, (error, data) => {
            return Payment.response(res, error, data);
        });
    });


module.exports = router;