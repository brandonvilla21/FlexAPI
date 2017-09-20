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

SaleProduct.general = cb => {
  if (connection) {
    connection.query(`
    SELECT 
           SP.*, 
           CONCAT(E.name, ' ', E.lastname) AS employee_fullname,
           CONCAT(C.name, ' ', C.lastname) AS customer_fullname

    FROM saleProduct AS SP 
    INNER JOIN employee AS E ON SP.employee_id = E.employee_id 
    INNER JOIN customer AS C ON SP.customer_id = C.customer_id `, (error, result) => {
      if (error)
        return cb(error);
      return cb(null, result);
    })
  } else
    return cb('Connection refused!');
}


SaleProduct.count = cb => {
  if ( connection ) {
      connection.query('SELECT COUNT (sale_id) AS number_of_sale FROM saleProduct', (error, result) => {
          if (error)
              return cb(error);
          return cb(null, result);
      })
  } else 
      return cb('Connection refused!');
}

// SaleProduct.findByIdJoin = (id, cb) => {
//   if (connection) {
//     connection.beginTransaction(error => {
//       if (error)
//         return cb(error);

//       async.parallel([
//         next => {
//           connection.query(
//             `SELECT PP.*, E.name AS employee_name,
//                           E.lastname AS employee_lastname, 
//                           E.address AS employee_address, 
//                           E.whatsapp AS employee_whatsapp

//             FROM saleProduct AS PP
//             INNER JOIN employee AS E ON E.employee_id = P.employee_id
//             WHERE sale_id = ?`,
//             [id], (error, result) => {
//             if (error)
//               next(error);
//             else
//               next(null, result[0]);
//           });
//         },

//         next => {
//           connection.query(
//             `SELECT PPP.*, E.description
//             FROM product_saleProduct AS PPP
//             INNER JOIN product AS P ON PPP.product_id = E.product_id
//             WHERE sale_id = ?`,
//           [id], (error, result) => {
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
//               else {
//                 results[0].product_saleProduct = results[1];
//                 return cb(null, results[0]);
//               }
//             });
//         });

//     });
//   } else
//     return cb('Connection refused!');
// }


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
    column: column,
    param: param,
    mainTable: "saleProduct", //The main table
    pivotTable: "product_saleProduct", //The secondary table which contains all the details that we want to get
    mainTableId: "sale_id" //The primary key from the main table, which is part of the pivotTable's composite primary key.
  }, cb);
}

SaleProduct.insert = (saleProduct, detailRows, updateRows, cb) => {
  if (connection) {
    connection.beginTransaction(error => {
      if (error)
        return cb(error);

      async.parallel([
        next => {
          connection.query('INSERT INTO saleProduct SET ?', [saleProduct], (error, result) => {
            if (error)
              next(error);
            else
              next(null, result);
          });
        },

        next => {
          connection.query('INSERT INTO product_saleProduct (sale_id, product_id, price, amount) VALUES ?', [detailRows], (error, result) => {
            if (error)
              next(error);
            else
              next(null, result);
          });
        },

        next => {
          async.each(updateRows, (item, cbb) =>{
            console.log(item);
            connection.query('UPDATE product SET existence = existence - ? WHERE product_id = ?', [item.amount, item.product_id], (error, result) => {
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


SaleProduct.response = (res, error, data) => {
  if (error)
    res.status(500).json(error);
  else
    res.status(200).json(data);
}

module.exports = SaleProduct;