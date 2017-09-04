var mysql = require('mysql');

const conn = mysql.createConnection({ 
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 8889,
    database: 'flex_admin'
});

module.exports =  conn;