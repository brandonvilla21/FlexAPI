const connection = require('../config/db-connection');
const values = require('object.values');
const async = require('async');

const dynamicQuery = {
  findByParamsWithPivotTable: (params, column, param, cb) => {
    if (connection) {
      connection.beginTransaction(error => {
        if (error)
          return cb(error);

        async.waterfall([
          next => {
            connection.query(`SELECT * FROM ?? WHERE ?? LIKE ?`, [params.mainTable, column, `${param}%`], (error, result) => {
              if (error)
                next(error);
              else {
                next(null, result);
              }
            });
          },

          (items, next) => {
          async.each(items, (item, nextEach) => {
            connection.query('SELECT * FROM ?? WHERE ?? = ?', [params.pivotTable, params.mainTableId, item[params.mainTableId]], (error, resultAsync) => {
              if (error)
                next(error);
              else {
                item[params.pivotTable] = resultAsync;
                nextEach();
              }
            });
          },
            err => {
              if (err)
                next(err);
              else
                next(null, items);
            })
        }
        ],
          (err, items) => {
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
                  return cb(null, items);
                }
              });
          });

      });
    }
  }
}

module.exports = dynamicQuery;