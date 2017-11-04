const connection = require('../config/db-connection');

let Provider = {}

Provider.all = cb => {
    if ( connection ) {
        connection.query('SELECT * FROM provider', (error, result) => {
            if (error)
                return cb(error);
            return cb(null, result);
        })
    } else 
        return cb('Connection refused!');
}

Provider.findById = ( id, cb ) => {
    if ( connection ) {
        connection.query('SELECT * FROM provider WHERE provider_id = ?', [id], (error, result) => {
            if ( error ) 
                return cb( error );
            return cb( null, result );
        });
    }
}

Provider.findByParam = (column, param, cb) => {
    if (connection) {
        connection.query(`SELECT * FROM provider WHERE ?? LIKE ?`, [column, `${param}%`], (error, row) => {
            if (error) return cb(error);
            return cb(null, row);
        })
    }
  }

Provider.insert = ( provider, cb ) => {
    if ( connection ) {
        connection.beginTransaction( error => {
            if ( error )
                return cb( error );

            connection.query('INSERT INTO provider SET ?', [provider], (error, result) => {
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

Provider.update = (provider, cb) => {
    
    if ( connection ) {
        connection.beginTransaction( error => {
            if ( error )
                return cb( error );

            connection.query(
                'UPDATE provider SET name = ?, description = ?, email = ?, phone = ?, contact = ? WHERE provider_id = ?',
                [provider.name, provider.description, provider.email, provider.phone, provider.contact, provider.provider_id], (error, result) => {
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

Provider.remove = ( id, cb ) => {
    if ( connection ) {
        connection.query('DELETE FROM provider WHERE provider_id = ?', [id], (error, result) => {
            if ( error )
                return cb(error);
            return cb( null, result );
        });
    }
}

Provider.response = (res, error, data) => {
    if (error) {
        // Save log in file
        logger.error(`Error on customer: ${JSON.stringify(error)}`)
        // Save log in DB
        error.message = 'Error on Provider';
        Pool.log( error )    
        res.status(500).json(error);
    } else
        res.status(200).json(data);
}

module.exports = Provider;