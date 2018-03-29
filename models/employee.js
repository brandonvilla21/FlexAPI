const connection = require('../config/db-connection');
const logger = require('../config/logger');
const Pool = require('../config/db-logger-connection');

let Employee = {}

Employee.all = cb => {
    if ( connection ) {
        connection.query('SELECT * FROM employee', (error, result) => {
            if (error)
                return cb(error);
            return cb(null, result);
        })
    } else 
        return cb('Connection refused!');
}

Employee.findById = ( id, cb ) => {
    if ( connection ) {
        connection.query('SELECT * FROM employee WHERE employee_id = ?', [id], (error, result) => {
            if ( error ) 
                return cb( error );
            return cb( null, result );
        });
    }
}

Employee.findByParam = (column, param, cb) => {
    if (connection) {
        connection.query(`SELECT * FROM employee WHERE ?? LIKE ?`, [column, `${param}%`], (error, row) => {
            if (error) return cb(error);
            return cb(null, row);
        })
    }
  }

Employee.insert = ( employee, cb ) => {
    if ( connection ) {
        connection.beginTransaction( error => {
            if ( error )
                return cb( error );

            connection.query('INSERT INTO employee SET ?', [employee], (error, result) => {
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

Employee.update = (employee, cb) => {
    
    if ( connection ) {
        connection.beginTransaction( error => {
            if ( error )
                return cb( error );

            connection.query(
                'UPDATE employee SET name = ?, lastname = ?, address = ?, whatsapp = ? WHERE employee_id = ?',
                [employee.name, employee.lastname, employee.address, employee.whatsapp, employee.employee_id], (error, result) => {
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

Employee.remove = ( id, cb ) => {
    if ( connection ) {
        connection.query('DELETE FROM employee WHERE employee_id = ?', [id], (error, result) => {
            if ( error )
                return cb(error);
            return cb( null, result );
        });
    }
}

Employee.response = (res, error, data) => {
    if (error) {
        // Save log in file
        logger.error(`Error on customer: ${JSON.stringify(error)}`)
        // Save log in DB
        error.message = 'Error on Employee';
        Pool.log( error )    
        res.status(500).json(error);
      }
    else
        res.status(200).json(data);
}

module.exports = Employee;