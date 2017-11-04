const connection = require('../config/db-connection');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const mySecretPass = 'mysecreetpassword';

let User = {};

User.register = ( user, cb ) => {
    if ( connection ) {
        connection.beginTransaction( error  => {
            if ( error ) return cb( cb );
            // Hash password
            bcrypt.hash(user.password, saltRounds)
            .then( hash => {
                user.password = hash;
                // Insert into table
                connection.query('INSERT INTO user SET ?', [user], ( error, results, fileds ) => {
                    if ( error ) {
                        if (error.code === 'ER_DUP_ENTRY') {
                            return connection.rollback( () => cb ( null, { 
                                success: false,
                                message: 'Este email ya esta en uso'
                            }));

                        } else
                            return connection.rollback( () => cb ( error ));
                    }
                        
                    connection.commit( error => {
                        if ( error )
                            return connection.rollback( () => cb( error ))
                    });
                    console.log('Success!');
                    return cb( null, { 
                        success: true,
                        message: 'Registro exitoso!',
                        result: results
                    });
                })
            })
            .catch( error => {
                return connection.rollback( () => cb ( error ));
            })
            
        })
    } else 
        return cb ('Connection refused');
}

User.login = ( email, password, cb ) => {
    if ( connection ) {
        connection.query(`
            SELECT user_id, password FROM user WHERE email = ?`, [email], (error, results, fields) => {
            if ( error )
                return cb ( error );
            if ( results[0] ) {
                const hash = results[0].password.toString();
                bcrypt.compare(password, hash, ( error, res ) => {
                    if ( res ) {
                        const user = {
                            email: results[0].email,
                            password: password
                        }
                        const token = jwt.sign(user, mySecretPass, {
                            expiresIn: 4000
                        });
                        return cb( null, { 
                            success: true,
                            message: 'Has iniciado sessión correctamente',
                            token: token 
                        });

                    } else 
                        return cb (null, {
                            success: false,
                            message: 'Password incorrecto'
                        } );
                    
                });
            } else {
                return cb(null, {
                    success: false,
                    message: 'El email y password no coinciden'
                })
            }

        });
    } else 
        return cb ('Connection refused');
}


User.response = (res, error, data) => {
    if (error) {
        // Save log in file
        logger.error(`Error on customer: ${JSON.stringify(error)}`)
        // Save log in DB
        error.message = 'Error on User';
        Pool.log( error )    
        res.status(500).json(error);
    } else
        res.status(200).json(data);
}
  
module.exports = User;