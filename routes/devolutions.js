const express = require('express');
const router = express.Router();
const Devolution = require('../models/devolution');
const values = require('object.values');
const async = require('async');

router
    .get('/', (req, res, next) =>{
        Devolution.all( ( error, data ) =>{
            return Devolution.response( res, error, data );
        })
    })
    .get('/general', (req, res, next) =>{
        Devolution.general( ( error, data ) =>{
            return Devolution.response( res, error, data );
        })
    })

    .get('/join/:id', (req, res, next) =>{
        Devolution.findByIdJoin(req.params.id, ( error, data ) =>{
            return Devolution.response( res, error, data );
        })
    })

    .get('/count', (req, res, next) =>{
        Devolution.count( ( error, data ) =>{
            return Devolution.response( res, error, data );
        })
    })

    .get('/:id', (req, res, next) =>{
        Devolution.findById(req.params.id, ( error, data ) => {
            return Devolution.response( res, error, data );
        })
    })

    .post('/', (req, res, next) => {
        const devolution = {
            devolution_id: null,
            sale_id: req.body.sale_id,
            employee_id: req.body.employee_id,
            devolution_date: req.body.devolution_date,
            total_returned: req.body.total_returned,
            concept: req.body.concept            
        }

        Devolution.insert(devolution, (error, data) => {
            return Devolution.response(res, error, data);
        });
    });


module.exports = router;