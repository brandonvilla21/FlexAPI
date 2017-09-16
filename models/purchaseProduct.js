const connection = require('../config/db-connection');
const values = require('object.values');
const async = require('async');

let PurchaseProduct = {}

PurchaseProduct.all = cb => {
    if ( connection ) {
        connection.query('SELECT * FROM purchaseProduct', (error, result) => {
            if (error)
                return cb(error);
            return cb(null, result);
        })
    } else 
        return cb('Connection refused!');
}

PurchaseProduct.findById = ( id, cb ) => {
    if ( connection ) {
        connection.query('SELECT * FROM purchaseProduct WHERE purchase_id = ?', [id], (error, result) => {
            if ( error ) 
                return cb( error );
            return cb( null, result );
        });
    }
}

PurchaseProduct.findByParam = (column, param, cb) => {
    if (connection) {
        connection.query(`SELECT * FROM purchaseProduct WHERE ?? LIKE ?`, [column, `${param}%`], (error, row) => {
            if (error) return cb(error);
            return cb(null, row);
        })
    }
}

PurchaseProduct.insert = ( purchaseProduct, detailRows, cb ) => {
    if ( connection ) {
        connection.beginTransaction( error => {
            if ( error )
                return cb( error );


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
                    return connection.rollback( () => { 
                      return cb(err) 
                    });
                  else 
                    connection.commit( error => {
                      if (error) 
                        return connection.rollback( () => { 
                          return cb (error) 
                        });
                      else
                        return cb( null, results );
                    });
              });

        });
    } else 
        return cb('Connection refused!');
}

// PurchaseProduct.update = (customer, cb) => {
    
//     if ( connection ) {
//         connection.beginTransaction( error => {
//             if ( error )
//                 return cb( error );

//             connection.query(
//                 'UPDATE customer SET name = ?, lastname = ?, reference = ?, whatsapp = ?, facebook = ?, balance = ? WHERE customer_id = ?',
//                 [customer.name, customer.lastname, customer.reference, customer.whatsapp, customer.facebook, customer.balance, customer.customer_id], (error, result) => {
//                 if ( error )
//                     return connection.rollback( () => {
//                         return cb ( error );
//                     });
//                 connection.commit( error => {
//                     if ( error )
//                         return connection.rollback( () => {
//                             return cb ( error );
//                         });
//                     console.log('Success!');
//                     return cb( null, result.insertId );
//                 });
//             });
//         });
//     } else 
//         return cb('Connection refused!');
// }

// PurchaseProduct.remove = ( id, cb ) => {
//     if ( connection ) {
//         connection.query('DELETE FROM customer WHERE customer_id = ?', [id], (error, result) => {
//             if ( error )
//                 return cb(error);
//             return cb( null, result );
//         });
//     }
// }

PurchaseProduct.response = (res, error, data) => {
    if ( error )
        res.status(500).json(error);
    else
        res.status(200).json(data);
}

module.exports = PurchaseProduct;