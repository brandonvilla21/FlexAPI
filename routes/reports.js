const express = require('express');
const router = express.Router();
const Report = require('../models/report');
const moment = require('moment');
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
    .post('/salesHistoryByColumnAndSaleTypeInAPeriod', (req, res, next) => {
      Report.salesHistoryByColumnAndSaleTypeInAPeriod( 
        moment(req.body.fromDate).format('YYYY-MM-DD'),
        moment(req.body.toDate).format('YYYY-MM-DD'),
        req.body.column,
        req.body.id,
        req.body.saleType, (error, data) => {
          return Report.response(res, error, data);
      });
  })
    
module.exports = router;