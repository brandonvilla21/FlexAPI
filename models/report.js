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

Report.getProductsWMinExistence = cb => {
    if (connection) {
        connection.beginTransaction( error => {
          if (error) return cb(error);

          connection.query('CALL getProductsWMinExistence()', (error, result) => {
            if (error) return cb(error);
            return cb(null, result[0]);
          })

        })
      } else
        return cb('Connection refused!');
}

Report.getTableData =  (tableName, cb) => {
  if ( connection )
      connection.query('CALL getTableData(?)', 
      [tableName], (error, result) => error ? cb(error) : cb(null, result[0]) );
  else 
    return cb('Connection refused');
}

Report.accountStatus = (debt, fromDate, userId, cb) => {
  if ( connection )
      connection.query('CALL accountStatus(?, ?, ?)', 
      [debt, fromDate, userId], (error, result) => error ? cb(error) : cb(null, result[0]) );
  else 
    return cb('Connection refused');
}

Report.getPaymentsBySaleId = (saleId, cb) => {
  if ( connection ) 
    connection.query('CALL getPaymentsBySaleId(?)', 
    [saleId], (error, result) => error ? cb(error) : cb(null, result[0]) );
  else 
    return cb('Connection refused');
}

Report.salesHistoryByColumnAndSaleTypeInAPeriod = (fromDate, toDate, column, id, saleType, cb) => {
  if (connection) {
      connection.beginTransaction( error => {
        if (error) return cb(error);

        connection.query('CALL salesHistoryByColumnAndSaleTypeInAPeriod(?, ?, ?, ?, ?)', 
                          [fromDate, toDate, column, id, saleType], (error, result) => {
          if (error) return cb(error);
          return cb(null, result[0]);
        })

      })
    } else
      return cb('Connection refused!');
}

Report.purchaseHistoryByColumnInAPeriod = (fromDate, toDate, column, id, cb) => {
  if (connection) {
      connection.beginTransaction( error => {
        if (error) return cb(error);

        connection.query('CALL purchaseHistoryByColumnInAPeriod(?, ?, ?, ?)', 
                          [fromDate, toDate, column, id], (error, result) => {
          if (error) return cb(error);
          return cb(null, result[0]);
        })

      })
    } else
      return cb('Connection refused!');
}


Report.response = (res, error, data) => {
  if (error) {
    // Save log in file
    logger.error(`Error on customer: ${JSON.stringify(error)}`)
    // Save log in DB
    error.message = 'Error on Reports';
    Pool.log( error )    
    res.status(500).json(error);
  } else
    res.status(200).json(data);
}
  
  module.exports = Report;