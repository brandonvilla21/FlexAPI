const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

router
    .get('/', (req, res, next) => {
        Customer.all( (error, data) => {
            return Customer.response(res, error, data);
        });
    })

    .get('/:id', (req, res, next) => {
        Customer.findById(req.params.id, (error, data) => {
            return Customer.response(res, error, data);
        });
    })

    .get('/byColumn/:column/:param', (req, res, next) => {
        Customer.findByParam( req.params.column, req.params.param, (error, data) => {
            return Customer.response(res, error, data);
        });
      })

    .post('/', (req, res, next) => {
        const customer = {
            customer_id: null,
            name: req.body.name,
            lastname: req.body.lastname,
            reference: req.body.reference,
            whatsapp: req.body.whatsapp,
            facebook: req.body.facebook,
            balance: req.body.balance,
        }
        Customer.insert(customer, (error, data) => {
            return Customer.response(res, error, data);
        })
    })

    .put('/:id', (req, res, next) => {
        const customer = {
            customer_id: req.params.id,
            name: req.body.name,
            lastname: req.body.lastname,
            reference: req.body.reference,
            whatsapp: req.body.whatsapp,
            facebook: req.body.facebook,
            balance: req.body.balance
        }

        Customer.update(customer, (error, data) => {
            return Customer.response(res, error, data);
        })
    })

    .delete('/:id', (req, res, next) => {
        Customer.remove(req.params.id, (error, data) => {
            return Customer.response(res, error, data);
        });
    });
    
module.exports = router;