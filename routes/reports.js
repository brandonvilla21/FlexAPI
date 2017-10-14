const express = require('express');
const router = express.Router();
const Report = require('../models/report');

router
    .get('/getCustomers', (req, res, next) => {
        Report.getCustomers( (error, data) => {
            return Report.response(res, error, data);
        });
    })
    .get('/getProducts', (req, res, next) => {
      Report.getProducts( (error, data) => {
          return Report.response(res, error, data);
      });
    })
    .get('/salesToPay', (req, res, next) => {
        Report.getSalesToPay( (error, data) => {
            return Report.response(res, error, data);
        });
    })
    
module.exports = router;