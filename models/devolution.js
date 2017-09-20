const connection = require('../config/db-connection');
const values = require('object.values');
const async = require('async');
const dynamicQueries = require('../services/dynamic.queries.service');

let Devolution = {};

Devolution.all = cb => {
    if (connection) {
        connection.query('SELECT * FROM devolution', (error, result) => {
          if (error)
            return cb(error);
          return cb(null, result);
        })
      } else
        return cb('Connection refused!');
}

Devolution.general = cb => {
    if (connection) {
        connection.query(`
        SELECT D.*, E.name
        FROM devolution AS D
        INNER JOIN employee AS E ON E.employee_id = D.employee_id`,
        (error, result) => {
          if (error)
            return cb(error);
          return cb(null, result);
        })
      } else
        return cb('Connection refused!');
}

Devolution.count = cb => {
    if (connection) {
        connection.query('SELECT COUNT (devolution_id) AS number_of_devolutions FROM devolution', (error, result) => {
          if (error)
            return cb(error);
          return cb(null, result);
        })
      } else
        return cb('Connection refused!');
}

Devolution.findByIdJoin = (id, cb) => {
    if (connection) {
      connection.beginTransaction(error => {
        if (error)
          return cb(error);
  
        async.parallel([
          next => {
            connection.query(
              `SELECT D.*, DP.*, P.description, SP.*, PSP.*
              FROM devolution AS D
              INNER JOIN devolution_product AS DP ON DP.devolution_id = D.devolution_id
              INNER JOIN product AS P ON P.product_id = DP.product_id
              INNER JOIN saleProduct AS SP ON SP.sale_id = D.sale_id
              INNER JOIN product_saleProduct AS PSP ON PSP.sale_id = SP.sale_id`,
              [id], (error, result) => {
              if (error)
                next(error);
              else
                next(null, result[0]);
            });
          },
  
        //   next => {
        //     connection.query(
        //       `SELECT PPP.*, P.description
        //       FROM product_purchaseProduct AS PPP
        //       INNER JOIN product AS P ON PPP.product_id = P.product_id
        //       WHERE purchase_id = ?`,
        //     [id], (error, result) => {
        //       if (error)
        //         next(error);
        //       else
        //         next(null, result);
        //     });
        //   }
        ],
  
          (err, results) => {
            if (err)
              return connection.rollback(() => {
                return cb(err)
              });
            else
              connection.commit(error => {
                if (error)
                  return connection.rollback(() => {
                    return cb(error)
                  });
                else {
                //   results[0].product_saleProduct = results[1];
                  return cb(null, results[0]);
                }
              });
          });
  
      });
    } else
      return cb('Connection refused!');
}
Devolution.response = (res, error, data) => {
    if (error)
      res.status(500).json(error);
    else
      res.status(200).json(data);
}
  
  module.exports = Devolution;