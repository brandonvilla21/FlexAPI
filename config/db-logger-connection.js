const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: process.env.LOG_DB_NAME,
});

const Pool = {};

Pool.log = message => {
   
    pool.getConnection( (err, connection) => {
        const properties = {
            message: message.message || '',
            code: message.code || '',
            errno: message.errno || '',
            sqlMessage: message.sqlMessage || '',
            sqlStateMessage: message.sqlState || '',
            indexMessage: message.index || '', 
            sqlQuery: message.sql || '',
            JSON: JSON.stringify(message)
        }
        if ( err ) {
            console.log('Error trying to connect with Data Base: ' + err.stack);
            return;
        }
        connection.query(`INSERT INTO log SET ?`, [properties], (error, result) => {
            console.log(error)
             // Done with the connection.
            connection.release();
        })
    });

    
}


module.exports =  Pool;