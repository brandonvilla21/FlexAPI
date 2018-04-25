const mysqlDump = require('mysqldump');
const multer = require('multer');
const async = require('async');
const importer = require('node-mysql-importer');
const mysql = require('mysql');
const csv = require('csvtojson');

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
    cb => { setFileEnvironmentRestore(req, res, options, cb) },
    (req, res, cb) => { importDatabase(req, res, options.db.username, options.db.password, cb) }
  ],

    error => {
      if (error) res.status(500).json(error);
      res.status(200).json({ sqlMessage: "Éxito restaurando la base de datos." });
      console.log("Success");
    });

}

MysqlUtilities.importFile = (req, res, options) => {

  async.waterfall([
    cb => { setFileEnvironmentImportCSV(req, res, options, cb)},
    (req, res, fileName, cb) => parseCsvToJSON(`./temp/${fileName}`, cb),
    (json, cb) => {
      const { modelName } = options;
      // In order to this can work, every model requested needs to have a multipleInserts method
      const routeModel = `../models/${modelName}`;
      const Model = require(routeModel);
      insertJSONtoTable(json, Model, cb);
    }
  ],

    error => {
      if (error) res.status(500).json(error);
      res.status(200).json({ sqlMessage: "Éxito importando el archivo csv." });
      console.log("Success");
    });

}

function insertJSONtoTable(json, Model, cb) {
  const values = parseJSONtoArray(json);
  Model.multipleInserts(values, (err, result) => {
    return err ? cb(err) : cb(null, result);
  });
}

function parseJSONtoArray(json) {
  const array = [];
  json.forEach( object => {
    let newArray = [];
    for (const key in object) {
      newArray.push(object[key]);
    }
    array.push(newArray);
  });
  return array;
}

function parseCsvToJSON(csvFilePath, cb) {
  const json = [];
  csv()
    // From the route file given 
    .fromFile(csvFilePath)
    // This method will be called n times where n = number of rows in csv file
    .on('json', (jsonObj) => json.push(jsonObj) )
    // This method will be called once the whole file has been parsed
    .on('done', (error) => error ? cb(error) : cb(null, json) );
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


function setFileEnvironmentRestore(req, res, options, cb) {
  let fileName = null;

  let storage = multer.diskStorage({ //multers disk storage settings
    destination: (req, file, cb) => {
      return cb(null, options.directory);
    },
    filename: (req, file, cb) => {
      const datetimestamp = Date.now();
      // If object options has fileName property, it will take that as the name of the file
      // Otherwise it will take the name of the file as it came from the client
      fileName = options.fileName
        ? `${options.fileName}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`
        : `${file.originalname.split('.')[0]}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`;

      return cb(null, fileName);
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


function setFileEnvironmentImportCSV(req, res, options, cb) {
  let fileName = null;

  let storage = multer.diskStorage({ //multers disk storage settings
    destination: (req, file, cb) => {
      return cb(null, options.directory);
    },
    filename: (req, file, cb) => {
      const datetimestamp = Date.now();
      // If object options has fileName property, it will take that as the name of the file
      // Otherwise it will take the name of the file as it came from the client
      fileName = options.fileName
        ? `${options.fileName}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`
        : `${file.originalname.split('.')[0]}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`;

      return cb(null, fileName);
    }
  });


  let upload = multer({ //multer settings
    storage: storage
  }).single('file');

  upload(req, res, err => {
    if (err) return cb(err);

    return cb(null, req, res, fileName)

  });

}

module.exports = MysqlUtilities;