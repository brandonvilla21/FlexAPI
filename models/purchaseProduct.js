const connection = require('../config/db-connection');
var values = require('object.values');

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

PurchaseProduct.insert = ( purchaseProduct, cb ) => {
    if ( connection ) {
        connection.beginTransaction( error => {
            if ( error )
                return cb( error );

            connection.query('INSERT INTO purchaseProduct SET ?', [purchaseProduct], (error, result) => {
                if ( error )
                    return connection.rollback( () => {
                        return cb ( error );
                    });

                });


            let vals = [];
            purchaseProduct.product_purchaseProduct
                    .forEach( element => vals.push(values( element )));

            connection.query('INSERT INTO product_purchaseProduct (purchase_id, product_id, price, amount) VALUES ?', [vals], (error, result2) => {
                if ( error )
                    return connection.rollback( () => {
                        return cb ( error );
                    });

                    connection.commit( error => {
                        if ( error )
                            return connection.rollback( () => {
                                return cb ( error );
                            });
                        console.log('Success!');
                        return cb( null, result2.insertId );
                    });
                    
                });

            //Inserts multiple records.
                
                
                // PurchaseProduct.getDetailQuery(purchaseProduct.product_purchaseProduct, connection);




        });
    } else 
        return cb('Connection refused!');
}

PurchaseProduct.getDetailQuery = (arrayDetails, connection) => {
    let sql = "";

    return;
    // for(var v in values)
    //     sql += "('" + connection.escape(values[v]) + "'),";
      
    //   sql = sql.substr(0,sql.length-1);

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