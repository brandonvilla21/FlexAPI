const connection = require('../config/db-connection');
const logger = require('../config/logger');
const Pool = require('../config/db-logger-connection');
const { waterfall } = require('async');

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

Report.getPaymentsByEmployee = (employeeId, cb) => {
  if (connection) {
      connection.beginTransaction( error => {
        if (error) return cb(error);

        connection.query(`
          SELECT * FROM payment AS P 
          WHERE P.employee_id = ?`,
          [employeeId], 
          (error, result) => {
            if (error) {
            return cb(error);
          }
          return cb(null, result);
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

Report.getMostSelledProducts = (numberOfProducts, cb) => {
  if (connection) {

        waterfall([

          //Get all the sales details to make comparison after on.
          next => {
            connection.query(
              `SELECT psp.product_id, psp.amount FROM \`product_saleProduct\` AS psp`, 
              (error, saleDetails) => {
    
                if (error) return next(error);
                return next(null, saleDetails);
              })
          },

          //Get all the product unique ids to make proper comparison and sort.
          (saleDetails, next) => {

            connection.query(`SELECT * FROM product`, (error, products) => {
            if (error) {
              console.log('error: ', error);
              return next(error);
            } else 
              return next(null, saleDetails, products);
            });

          },

          (saleDetails, products, next) => {

            //Loops to get all the amount of units that were selled.
            products.forEach( product => {

              product.selledUnits = 0;
              saleDetails.forEach( detail => {
                if( detail.product_id === product.product_id) 
                  product.selledUnits += Number(detail.amount);
              });

            });

            products.sort((a, b) => 
              parseFloat(a.selledUnits) - parseFloat(b.selledUnits)
            );

            const mostSelledProducts = products.reverse();

            return process.nextTick(() => next(null, mostSelledProducts.slice(0, numberOfProducts)))

          },

         
        ],
          (err, items) => {
            if (err)
              return cb(err)
            else
              return cb(null, items);
          });

        
    } else
      return cb('Connection refused!');
}

Report.getMostWantedFlavors = (numberOfFlavors, cb) => {
  if (connection) {

        waterfall([

           //Get all the sales with product information
           next => {

            connection.query(`
            SELECT product_saleProduct.*, product.*
            FROM product_saleProduct
            INNER JOIN product ON product.product_id = product_saleProduct.product_id`, (error, sales) => {
            if (error) {
              console.log('error: ', error);
              return next(error);
            } else 
              return next(null, sales);
            });

          },

          (sales, next) => {
            const flavors = {
              VAINILLA: {
                name: 'VAINILLA',
                products: 0,
              },
              CHOCOLATE: {
                name: 'CHOCOLATE',
                products: 0,
              },
              FRESA: {
                name: 'FRESA',
                products: 0,
              },
              COOKIES: {
                name: 'COOKIES',
                products: 0,
              },
              CEREZA: {
                name: 'CEREZA',
                products: 0,
              },
              NUEZ: {
                name: 'NUEZ',
                products: 0,
              },
              PINA: {
                name: 'PIÑA',
                products: 0,
              },
              DURAZNO: {
                name: 'DURAZNO',
                products: 0,
              },
              OTRO: {
                name: 'OTRO',
                products: 0,
              },
            };

            // Loops all sales to collect the flavor product an its amount
            sales.forEach( sale => {
              if ( flavors[sale.flavor] )
                flavors[sale.flavor].products = flavors[sale.flavor].products + sale.amount;
            });
            
            // Convert object to array so it can be sorted and returned
            const sortable = [];
            for( flavor in flavors )
              sortable.push(flavors[flavor]);

            sortable.sort((a, b) => 
              parseFloat(b.products) - parseFloat(a.products)
            );

            return process.nextTick(() => next(null, sortable.slice(0, numberOfFlavors)));

          },

         
        ],
          (err, items) => {
            if (err)
              return cb(err)
            else
              return cb(null, items);
          });

        
    } else
      return cb('Connection refused!');
}

Report.getMissingProductsByMin = cb => {
  if ( !connection )
    return cb('Connection refused!');
  connection.query(`SELECT * FROM product WHERE existence < min`, (err, products) => {
    if ( err )
      return cb(err);
    return cb(null, products);
  })
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