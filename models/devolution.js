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
        SELECT D.*, E.name AS employee_name
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
// Not finished yet
Devolution.findById = (id, cb) => {
  if ( !connection ) 
    return cb('Connection refused!');
  connection.beginTransaction( error => {
    if (error)
      return cb(error);
    connection.query('SELECT * FROM devolution WHERE devolution_id = ?', [id], (error, result) =>{
      if ( error )
        return cb(error);
      return cb( null, result );
    })
  });

}

// Not finished yet
Devolution.findByIdJoin = (id, cb) => {
    if (connection) {
      connection.beginTransaction(error => {
        if (error)
          return cb(error);
  
        async.parallel([
          next => {
            connection.query(
              `SELECT D.devolution_id, D.sale_id, D.devolution_date, D.total_returned, D.concept,
                      SP.*, 
                      ED.employee_id AS devolution_employee_id, ED.name AS devolution_employee_name,
                      ES.employee_id AS sale_employee_id, ES.name AS sale_employee_name
              FROM devolution AS D
              INNER JOIN saleProduct AS SP ON SP.sale_id = D.sale_id
              INNER JOIN employee AS ED ON ED.employee_id = D.employee_id
              INNER JOIN employee AS ES ON ES.employee_id = SP.employee_id
              WHERE devolution_id = ?`,
              [id], (error, result) => {
              if (error)
                next(error);
              else
                next(null, result[0]);
            });
          },
  
          next => {
            connection.query(
              `SELECT PSP.*, P.description
              FROM product_saleProduct AS PSP
              INNER JOIN product AS P ON PSP.product_id = P.product_id
              WHERE sale_id = ?`,
            [id], (error, result) => {
              if (error)
                next(error);
              else
                next(null, result);
            });
          }
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
                  results[0].product_saleProduct = results[1];
                  return cb(null, results[0]);
                }
              });
          });
  
      });
    } else
      return cb('Connection refused!');
}

Devolution.insert = (devolution, cb) => {
  if(connection) {

      connection.beginTransaction( err => {
          if (err) return cb( err );


          async.waterfall([
            next => {
              connection.query('INSERT INTO devolution SET ?', [devolution], (error, result) => {
                if (error)
                  next(error);
                else {
                  next(null);
                }
              });
            },
  
            next => {
              connection.query(`UPDATE saleProduct SET state='CANCELADO' WHERE sale_id = ?`, [devolution.sale_id], (error, result) => {
                if (error)
                  next(error);
                else {
                  next(null);
                }
              });
            },

            next => {
              connection.query(`SELECT * FROM product_saleproduct WHERE sale_id = ?`, [devolution.sale_id], (error, result) => {
                if (error)
                  next(error);
                else {
                  next(null, result);
                }
              });
            },

            (items, next) => {
              async.each(items, (item, cbb) => {
                connection.query('UPDATE product SET existence = existence + ? WHERE product_id = ?', [item.amount, item.product_id], (error, result) => {
                  cbb();
                });
              },
    
                err => {
                  if (err)
                    next(err);
                  else
                    next(null, "success");
                }
    
              )
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


          // connection.query('INSERT INTO devolution SET ?', [devolution], (error, result) => {
          //   if(error) 
          //       return connection.rollback( () => {
          //           return cb(error);
          //       });
          //   connection.query(`UPDATE saleProduct SET state='CANCELADO' WHERE sale_id = ?`, [devolution.sale_id], (error, result) =>{
          //     if ( error )
          //       return connection.rollback( () => {
          //         return cb( error );
          //       })
          //       connection.commit( err => {
          //           if (error)
          //               return connection.rollback( () => {
          //                   return cb(error);
          //               });
          //           console.log("Success!");
          //           return cb(null, result);
          //       });
          //   });
          // });
      });
  } else
      return cb('Connection refused');
}

Devolution.response = (res, error, data) => {
    if (error) {
      // Save log in file
      logger.error(`Error on customer: ${JSON.stringify(error)}`)
      // Save log in DB
      error.message = 'Error on devolution';
      Pool.log( error )    
      res.status(500).json(error);
    }
    else
      res.status(200).json(data);
}
  
  module.exports = Devolution;