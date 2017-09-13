const connection = require('../config/db-connection');

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

// PurchaseProduct.insert = ( customer, cb ) => {
//     if ( connection ) {
//         connection.beginTransaction( error => {
//             if ( error )
//                 return cb( error );

//             connection.query('INSERT INTO customer SET ?', [customer], (error, result) => {
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