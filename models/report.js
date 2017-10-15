const connection = require('../config/db-connection');
let Report = {};

Report.getCustomers = cb => {
    if (connection) {
        connection.beginTransaction( error => {
          if (error) return cb(error);

          connection.query('CALL getCustomers()', (error, result) => {
            if (error) return cb(error);
            return cb(null, result[0]);
          })

        })
      } else
        return cb('Connection refused!');
}

Report.getProducts = cb => {
  if (connection) {
      connection.beginTransaction( error => {
        if (error) return cb(error);

        connection.query('CALL getProducts()', (error, result) => {
          if (error) return cb(error);
          return cb(null, result[0]);
        })

      })
    } else
      return cb('Connection refused!');
}

Report.getSalesToPay = cb => {
    if (connection) {
        connection.beginTransaction( error => {
          if (error) return cb(error);

          connection.query('CALL salesToPay()', (error, result) => {
            if (error) return cb(error);
            return cb(null, result[0]);
          })

        })
      } else
        return cb('Connection refused!');
}

//This endpoint can serves at least to reports.
Report.salesHistoryByColumnInAPeriod = (fromDate, toDate, column, id, cb) => {
  if (connection) {
      connection.beginTransaction( error => {
        if (error) return cb(error);

        connection.query('CALL salesHistoryByColumnInAPeriod(?, ?, ?, ?)', 
                          [fromDate, toDate, column, id], (error, result) => {
          if (error) return cb(error);
          return cb(null, result[0]);
        })

      })
    } else
      return cb('Connection refused!');
}

Report.response = (res, error, data) => {
    if (error)
      res.status(500).json(error);
    else
      res.status(200).json(data);
}
  
  module.exports = Report;