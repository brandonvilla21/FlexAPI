const connection = require('../config/db-connection');
const values = require('object.values');
const async = require('async');

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
  if (connection) {
    connection.beginTransaction(error => {
      if (error)
        return cb(error);

      async.waterfall([
        next => {
          connection.query(`SELECT * FROM purchaseProduct WHERE ?? LIKE ?`, [column, `${param}%`], (error, result) => {
            if (error)
              next(error);
            else {
              next(null, result);
            }
          });
        },

        (purchaseProducts, next) => {
          async.each(purchaseProducts, (item, nextEach) => {
            connection.query('SELECT * FROM product_purchaseProduct WHERE purchase_id = ?', [item.purchase_id], (error, resultAsync) => {
              if (error)
                next(error);
              else {
                item.product_purchaseProduct = resultAsync;
                nextEach();
              }
            });
          },
            err => {
              if (error)
                next(err);
              else
                next(null, purchaseProducts);
            })
        }
      ],

        (err, purchaseProducts) => {
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
                return cb(null, purchaseProducts);
              }
            });
        });

    });
  }
}

PurchaseProduct.insert = (purchaseProduct, detailRows, cb) => {
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
  if (error)
    res.status(500).json(error);
  else
    res.status(200).json(data);
}

module.exports = PurchaseProduct;