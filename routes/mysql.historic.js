const router = require('express').Router()
const MySQLHistoricService = require('../services/mysql.historic.service');

router
    
    .post('/', (req, res) => {
        const startDate = require('moment')(req.body.initialDate).format('YYYY-MM-DD');
        const endDate = require('moment')(req.body.finalDate).format('YYYY-MM-DD');
        MySQLHistoricService.generateHistoric( startDate, endDate ,(error, data) => {
            return MySQLHistoricService.response(res, error, data); 
        })
        
    })

module.exports = router;