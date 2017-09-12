const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');

router

    .get('/', (req, res, next) => {
        Employee.all( (error, data) => {
            return Employee.response(res, error, data);
        });
    })

    .get('/:id', (req, res, next) => {
        Employee.findById(req.params.id, (error, data) => {
            return Employee.response(res, error, data);
        });
    })

    .get('/byColumn/:column/:param', (req, res, next) => {
        Employee.findByParam( req.params.column, req.params.param, (error, data) => {
            return Employee.response(res, error, data);
        });
      })

    .post('/', (req, res, next) => {
        const employee = {
            employee_id: null,
            name: req.body.name,
            lastname: req.body.lastname,
            address: req.body.address,
            whatsapp: req.body.whatsapp
        }
        Employee.insert(employee, (error, data) => {
            return Employee.response(res, error, data);
        })
    })

    .put('/:id', (req, res, next) => {
        const employee = {
            employee_id: req.params.id,
            name: req.body.name,
            lastname: req.body.lastname,
            address: req.body.address,
            whatsapp: req.body.whatsapp
        }

        Employee.update(employee, (error, data) => {
            return Employee.response(res, error, data);
        })
    })

    .delete('/:id', (req, res, next) => {
        Employee.remove(req.params.id, (error, data) => {
            return Employee.response(res, error, data);
        });
    });
    
module.exports = router;