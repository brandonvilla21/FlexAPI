const router = require('express').Router()
const MySQLHistoricService = require('../services/mysql.historic.service');

router
    // Esta ruta es nomas para que pruebes con un GET gg, luego se va a eliminar
    .get('/', (req, res) => {
        MySQLHistoricService.generateHistoric( '2017-01-01', '2017-12-31' ,(error, data) => {
            console.log('Error:', error)
            console.log('Result:', data)
            return MySQLHistoricService.response(res, error, data); 
        })
    })
    // Este sería el que debes consumir
    .post('/:start/:end', (req, res) => {
        const startDate = req.params.start;
        const endDate = req.params.end;
        MySQLHistoricService.generateHistoric( startDate, endDate ,(error, data) => {
            return MySQLHistoricService.response(res, error, data); 
        })
    })

module.exports = router;