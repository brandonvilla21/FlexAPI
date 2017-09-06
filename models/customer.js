const connection = require('../config/db-connection');

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
                    return cb( null, result.insertId );
                });
            });
        });
    } else 
        return cb('Connection refused!');
}

Customer.remove = ( id, cb ) => {
    if ( connection ) {
        connection.query('DELETE FROM customer WHERE cutomer_id = ?', [id], (error, result) => {
            if ( error )
                return cb(error);
            return cb( null, result );
        });
    }
}

Customer.response = (res, error, data) => {
    if ( error )
        res.status(500).json(error);
    else
        res.status(200).json(data);
}

module.exports = Customer;