const express = require('express');
const router = express.Router();
const Provider = require('../models/provider');

router
    .get('/', (req, res, next) => {
        Provider.all( (error, data) => {
            return Provider.response(res, error, data);
        });
    })

    .get('/:id', (req, res, next) => {
        Provider.findById(req.params.id, (error, data) => {
            return Provider.response(res, error, data);
        });
    })

    .post('/', (req, res, next) => {
        const provider = {
            provider_id: null,
            name: req.body.name,
            description: req.body.description,
            email: req.body.email,
            phone: req.body.phone,
            contact: req.body.contact
        }
        Provider.insert(provider, (error, data) => {
            return Provider.response(res, error, data);
        })
    })

    .put('/:id', (req, res, next) => {
        const provider = {
            provider_id: req.params.id,
            name: req.body.name,
            description: req.body.description,
            email: req.body.email,
            phone: req.body.phone,
            contact: req.body.contact
        }

        Provider.update(provider, (error, data) => {
            return Provider.response(res, error, data);
        })
    })

    .delete('/:id', (req, res, next) => {
        Provider.remove(req.params.id, (error, data) => {
            return Provider.response(res, error, data);
        });
    });
    
module.exports = router;