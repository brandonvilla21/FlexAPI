const connection = require('../config/db-connection');
const logger = require('../config/logger');
const Pool = require('../config/db-logger-connection');

let Customer = {}

Customer.all = cb => {
    if ( connection ) {
        connection.query('SELECT * FROM customer', (error, result) => {
            if (error)
                return cb(error);
            return cb(null, result);
        })
    } else 
        return cb('Connection refused!');
}

Customer.findById = ( id, cb ) => {
    if ( connection ) {
        connection.query('SELECT * FROM customer WHERE customer_id = ?', [id], (error, result) => {
            if ( error ) 
                return cb( error );
            return cb( null, result );
        });
    }
}

Customer.findByParam = (column, param, cb) => {
    if (connection) {
        connection.query(`SELECT * FROM customer WHERE ?? LIKE ?`, [column, `${param}%`], (error, row) => {
            if (error) return cb(error);
            return cb(null, row);
        })
    }
}

Customer.insert = ( customer, cb ) => {
    if ( connection ) {
        connection.beginTransaction( error => {
            if ( error )
                return cb( error );

            connection.query('INSERT INTO customer SET ?', [customer], (error, result) => {
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
                    return cb( null, result );
                });
            });
        });
    } else 
        return cb('Connection refused!');
}

Customer.update = (customer, cb) => {
    
    if ( connection ) {
        connection.beginTransaction( error => {
            if ( error )
                return cb( error );

            connection.query(
                'UPDATE customer SET name = ?, lastname = ?, reference = ?, whatsapp = ?, facebook = ?, balance = ? WHERE customer_id = ?',
                [customer.name, customer.lastname, customer.reference, customer.whatsapp, customer.facebook, customer.balance, customer.customer_id], (error, result) => {
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
                    return cb( null, result.insertId );
                });
            });
        });
    } else 
        return cb('Connection refused!');
}

Customer.remove = ( id, cb ) => {
    if ( connection ) {
        connection.query('DELETE FROM customer WHERE customer_id = ?', [id], (error, result) => {
            if ( error )
                return cb(error);
            return cb( null, result );
        });
    }
}

Customer.response = (res, error, data) => {
    if ( error ) {
        // Save log in file
        logger.error(`Error on customer: ${JSON.stringify(error)}`)
        // Save log in DB
        error.message = 'Error on customer';
        Pool.log( error )        
        res.status(500).json(error);
    }
    else 
        res.status(200).json(data);
}

module.exports = Customer;
