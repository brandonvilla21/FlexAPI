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
    });


module.exports = router;