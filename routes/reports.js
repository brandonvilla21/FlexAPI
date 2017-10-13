const express = require('express');
const router = express.Router();
const Report = require('../models/report');

router
    .get('/getCustomers', (req, res, next) => {
        Report.getCustomers( (error, data) => {
            return Report.response(res, error, data);
        });
    })
    
module.exports = router;