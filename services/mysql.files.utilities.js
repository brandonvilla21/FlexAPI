const mysqlDump = require('mysqldump');
const multer = require('multer');
const async = require('async');
const importer = require('node-mysql-importer');
const mysql = require('mysql');

let MysqlUtilities = {};

MysqlUtilities.backup = (res, options) => {
  mysqlDump({
    host: process.env.HOST,
    database: process.env.DB_NAME,
    user: options.db.username,
    password: options.db.password,
    port: process.env.DB_PORT,
    dest: `${options.directory}${process.env.DB_NAME}_backup.sql` // destination file 
  }, (err) => {
    if (err)
      return res.status(500).json({ message: "Credenciales incorrectas." });
    else
      return res.download(`${options.directory}${process.env.DB_NAME}_backup.sql`);

  });
}

MysqlUtilities.restore = (req, res, options) => {

  async.waterfall([
    cb => { setFileEnvironment(req, res, options, cb) },
    (req, res, cb) => { importDatabase(req, res, options.db.username, options.db.password, cb) }
  ],

    error => {
      if (error) res.status(500).json(error);
      res.status(200).json({ sqlMessage: "Éxito restaurando la base de datos." });
      console.log("Success");
    });

}


function importDatabase(req, res, username, password, cb) {

  importer.config({
    'host': process.env.DB_HOST,
    'user': username,
    'password': password,
    'port': process.env.DB_PORT,    
    'database': process.env.DB_NAME
  });

  const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: username,
    password: password,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    multipleStatements: process.env.MULTI_STATEMENTS

  });

  conn.connect(err => {
    if (err) {
      console.log('Error trying to connect with Data Base: ' + err.stack);

      if(err.sqlState == 28000)
        return cb({sqlMessage: 'Username o password incorrecto.'});
        
      return cb(err);
    }

    console.log('Valid Credentials');



    conn.query("CALL procDropAllTables()", (error, result) => {
      if (error) return cb(error);

      //Importing database.
      importer.importSQL('./temp/uploadedRestore.sql')
        .then(() => {
          conn.end();
          return cb(null);
        }).catch(err => {
          
          console.log(`error on Promise.catch: ${err}`);
          conn.end();
          return cb(err);

        })
    })

  });

}


function setFileEnvironment(req, res, options, cb) {

  let storage = multer.diskStorage({ //multers disk storage settings
    destination: (req, file, cb) => {
      return cb(null, options.directory);
    },
    filename: (req, file, cb) => {
      const datetimestamp = Date.now();
      return cb(null, 'uploadedRestore' + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
  });


  let upload = multer({ //multer settings
    storage: storage
  }).single('file');

  upload(req, res, err => {
    if (err) return cb(err);

    return cb(null, req, res)

  });

}

module.exports = MysqlUtilities;