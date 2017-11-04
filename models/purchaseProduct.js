const connection = require('../config/db-connection');
const values = require('object.values');
const async = require('async');
const dynamicQueries = require('../services/dynamic.queries.service');

let PurchaseProduct = {}

PurchaseProduct.all = cb => {
  if (connection) {
    connection.query('SELECT * FROM purchaseProduct', (error, result) => {
      if (error)
        return cb(error);
      return cb(null, result);
    })
  } else
    return cb('Connection refused!');
}

PurchaseProduct.general = cb => {
  if (connection) {
    connection.query('SELECT PP.*, P.name AS provider_name FROM purchaseProduct AS PP INNER JOIN provider AS P ON PP.provider_id = P.provider_id', (error, result) => {
      if (error)
        return cb(error);
      return cb(null, result);
    })
  } else
    return cb('Connection refused!');
}

PurchaseProduct.count = cb => {
    if ( connection ) {
        connection.query('SELECT COUNT (purchase_id) AS number_of_purchase FROM purchaseProduct', (error, result) => {
            if (error)
                return cb(error);
            return cb(null, result);
        })
    } else 
        return cb('Connection refused!');
}

PurchaseProduct.findByIdJoin = (id, cb) => {
  if (connection) {
    connection.beginTransaction(error => {
      if (error)
        return cb(error);

      async.parallel([
        next => {
          connection.query(
            `SELECT PP.*, P.name AS provider_name, P.email AS provider_email, P.contact AS provider_email, P.phone AS provider_phone
            FROM purchaseProduct AS PP
            INNER JOIN provider AS P ON PP.provider_id = P.provider_id
            WHERE purchase_id = ?`,
            [id], (error, result) => {
            if (error)
              next(error);
            else
              next(null, result[0]);
          });
        },

        next => {
          connection.query(
            `SELECT PPP.*, P.description
            FROM product_purchaseProduct AS PPP
            INNER JOIN product AS P ON PPP.product_id = P.product_id
            WHERE purchase_id = ?`,
          [id], (error, result) => {
            if (error)
              next(error);
            else
              next(null, result);
          });
        }
      ],

        (err, results) => {
          if (err)
            return connection.rollback(() => {
              return cb(err)
            });
          else
            connection.commit(error => {
              if (error)
                return connection.rollback(() => {
                  return cb(error)
                });
              else {
                results[0].product_purchaseProduct = results[1];
                return cb(null, results[0]);
              }
            });
        });

    });
  } else
    return cb('Connection refused!');
}

PurchaseProduct.findById = (id, cb) => {
  if (connection) {
    connection.beginTransaction(error => {
      if (error)
        return cb(error);

      async.parallel([
        next => {
          connection.query('SELECT * FROM purchaseProduct WHERE purchase_id = ?', [id], (error, result) => {
            if (error)
              next(error);
            else
              next(null, result[0]);
          });
        },

        next => {
          connection.query('SELECT * FROM product_purchaseProduct WHERE purchase_id = ?', [id], (error, result) => {
            if (error)
              next(error);
            else
              next(null, result);
          });
        }
      ],

        (err, results) => {
          if (err)
            return connection.rollback(() => {
              return cb(err)
            });
          else
            connection.commit(error => {
              if (error)
                return connection.rollback(() => {
                  return cb(error)
                });
              else {
                results[0].product_purchaseProduct = results[1];
                return cb(null, results[0]);
              }
            });
        });

    });
  } else
    return cb('Connection refused!');
}

PurchaseProduct.findByParam = (column, param, cb) => {
  dynamicQueries.findByParamsWithPivotTable({
    column: column,
    param: param,
    mainTable: "purchaseProduct", //The main table
    pivotTable: "product_purchaseProduct", //The secondary table which contains all the details that we want to get
    mainTableId: "purchase_id" //The primary key from the main table, which is part of the pivotTable's composite primary key.
  }, cb);
}

PurchaseProduct.insert = (purchaseProduct, detailRows, updateRows, cb) => {
  if (connection) {
    connection.beginTransaction(error => {
      if (error)
        return cb(error);

      async.parallel([
        next => {
          connection.query('INSERT INTO purchaseProduct SET ?', [purchaseProduct], (error, result) => {
            if (error)
              next(error);
            else
              next(null, result);
          });
        },

        next => {
          connection.query('INSERT INTO product_purchaseProduct (purchase_id, product_id, price, amount) VALUES ?', [detailRows], (error, result) => {
            if (error)
              next(error);
            else
              next(null, result);
          });
        },

        next => {
          async.each(updateRows, (item, cbb) =>{
            console.log(item);
            connection.query('UPDATE product SET existence = existence + ?, buy_price = ? WHERE product_id = ?', [item.amount, item.price, item.product_id], (error, result) => {
              cbb();
            });
          },

            err => {
              if (err)
                next(err);
              else
                next(null, "success");
            }

          )
        }
      ],

        (err, results) => {
          if (err)
            return connection.rollback(() => {
              return cb(err)
            });
          else
            connection.commit(error => {
              if (error)
                return connection.rollback(() => {
                  return cb(error)
                });
              else
                return cb(null, results);
            });
        });

    });
  } else
    return cb('Connection refused!');
}


PurchaseProduct.response = (res, error, data) => {
  if (error) {
    // Save log in file
    logger.error(`Error on customer: ${JSON.stringify(error)}`)
    // Save log in DB
    error.message = 'Error on Purchase Product';
    Pool.log( error )    
    res.status(500).json(error);
  } else
    res.status(200).json(data);
}

module.exports = PurchaseProduct;