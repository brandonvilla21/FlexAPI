const connection = require('../config/db-connection');
const values = require('object.values');
const async = require('async');
const dynamicQueries = require('../services/dynamic.queries.service');

let SaleProduct = {}

SaleProduct.all = cb => {
  if (connection) {
    connection.query('SELECT * FROM saleProduct', (error, result) => {
      if (error)
        return cb(error);
      return cb(null, result);
    })
  } else
    return cb('Connection refused!');
}

SaleProduct.findById = (id, cb) => {
  if (connection) {
    connection.beginTransaction(error => {
      if (error)
        return cb(error);

      async.parallel([
        next => {
          connection.query('SELECT * FROM saleProduct WHERE sale_id = ?', [id], (error, result) => {
            if (error)
              next(error);
            else
              next(null, result[0]);
          });
        },

        next => {
          connection.query('SELECT * FROM product_saleProduct WHERE sale_id = ?', [id], (error, result) => {
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
                results[0].product_saleProduct = results[1];
                return cb(null, results[0]);
              }
            });
        });

    });
  } else
    return cb('Connection refused!');
}

SaleProduct.findByParam = (column, param, cb) => {
  dynamicQueries.findByParamsWithPivotTable({
    mainTable: "saleProduct", //The main table
    pivotTable: "product_saleProduct", //The secondary table which contains all the details that we want to get
    mainTableId: "sale_id" //The primary key from the main table, which is part of the pivotTable's composite primary key.
  }, column, param, cb);
}

// SaleProduct.insert = (saleProduct, detailRows, cb) => {
//   if (connection) {
//     connection.beginTransaction(error => {
//       if (error)
//         return cb(error);

//       async.parallel([
//         next => {
//           connection.query('INSERT INTO saleProduct SET ?', [saleProduct], (error, result) => {
//             if (error)
//               next(error);
//             else
//               next(null, result);
//           });
//         },

//         next => {
//           connection.query('INSERT INTO product_saleProduct (sale_id, product_id, price, amount) VALUES ?', [detailRows], (error, result) => {
//             if (error)
//               next(error);
//             else
//               next(null, result);
//           });
//         }
//       ],

//         (err, results) => {
//           if (err)
//             return connection.rollback(() => {
//               return cb(err)
//             });
//           else
//             connection.commit(error => {
//               if (error)
//                 return connection.rollback(() => {
//                   return cb(error)
//                 });
//               else
//                 return cb(null, results);
//             });
//         });

//     });
//   } else
//     return cb('Connection refused!');
// }


SaleProduct.response = (res, error, data) => {
  if (error)
    res.status(500).json(error);
  else
    res.status(200).json(data);
}

module.exports = SaleProduct;