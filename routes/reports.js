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
    .get('/getProductsWMinExistence', (req, res, next) => {
        Report.getProductsWMinExistence( (error, data) => {
            return Report.response(res, error, data);
        });
    })
    .get('/getTableData/:table', (req, res, next) => {
        const tableName = req.params.table;
        Report.getTableData( tableName, (error, data) => {
            return Report.response(res, error, data);
        });
    })  
    .get('/getPaymentsBySaleId/:saleId', (req, res, next) => {
        const saleId = req.params.saleId;
        Report.getPaymentsBySaleId( saleId, (error, data) => {
            return Report.response(res, error, data);
        });
    })  
    .get('/accountStatus/:debt/:fromDate/:userId', (req, res, next) => {
        const debt = req.params.debt;
        const fromDate = req.params.fromDate;
        const userId = req.params.userId;
        Report.accountStatus( debt, fromDate, userId, (error, data) => {
            return Report.response(res, error, data);
        });
    })  
    .post('/salesHistoryByColumnInAPeriod', (req, res, next) => {
        Report.salesHistoryByColumnInAPeriod( 
            moment(req.body.fromDate).format('YYYY-MM-DD'),
            moment(req.body.toDate).format('YYYY-MM-DD'),
            req.body.column,
            req.body.id, (error, data) => {
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
  .post('/purchaseHistoryByColumnInAPeriod', (req, res, next) => {
    Report.purchaseHistoryByColumnInAPeriod(
      moment(req.body.fromDate).format('YYYY-MM-DD'),
      moment(req.body.toDate).format('YYYY-MM-DD'),
      req.body.column,
      req.body.id, (error, data) => {
        return Report.response(res, error, data);
      });
  })

module.exports = router;