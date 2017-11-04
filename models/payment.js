const connection = require('../config/db-connection');
const values = require('object.values');
const async = require('async');
const dynamicQueries = require('../services/dynamic.queries.service');

let Payment = {};

Payment.all = cb => {
    if (connection) {
        connection.query('SELECT * FROM payment', (error, result) => {
          if (error)
            return cb(error);
          return cb(null, result);
        })
      } else
        return cb('Connection refused!');
}

Payment.general = cb => {
    if (connection) {
      connection.query(`
      SELECT 
             P.*, 
             CONCAT(E.name, ' ', E.lastname) AS employee_fullname

      FROM payment AS P 
      INNER JOIN employee AS E ON P.employee_id = E.employee_id`, (error, result) => {
        if (error)
          return cb(error);
        return cb(null, result);
      })
    } else
      return cb('Connection refused!');
  }

Payment.count = cb => {
    if (connection) {
        connection.query('SELECT COUNT (payment_id) AS number_of_payments FROM payment', (error, result) => {
          if (error)
            return cb(error);
          return cb(null, result);
        })
      } else
        return cb('Connection refused!');
}


Payment.findById = (id, cb) => {
  if ( !connection ) 
    return cb('Connection refused!');
  connection.beginTransaction( error => {
    if (error)
      return cb(error);
    connection.query('SELECT * FROM payment WHERE payment_id = ?', [id], (error, result) =>{
      if ( error )
        return cb(error);
      return cb( null, result );
    })
  });

}

Payment.findByParam = (column, param, cb) => {
  if (connection) {
      connection.query(`SELECT * FROM payment WHERE ?? LIKE ?`, [column, `${param}%`], (error, row) => {
          if (error) return cb(error);
          return cb(null, row);
      })
  }
}

Payment.findByIdJoin = (id, cb) => {
    if (connection) {
      connection.beginTransaction(error => {
        if (error)
          return cb(error);
  
        async.parallel([
          next => {
            connection.query(
              `SELECT P.*, E.name AS employee_name, E.lastname AS employee_lastname, 
                      E.address AS employee_address, E.whatsapp AS employee_whatsapp
              
               FROM payment AS P
  
               INNER JOIN employee AS E ON E.employee_id = P.employee_id
               WHERE payment_id = ?
              `,
              [id], (error, result) => {
              if (error)
                next(error);
              else
                next(null, result[0]);
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
                else 
                  return cb(null, results[0]);
              });
          });
  
      });
    } else
      return cb('Connection refused!');
  }

Payment.insert = (payment, cb) => {
  if(connection) {

      connection.beginTransaction( err => {
          if (err) return cb( err );

          async.waterfall([
            next => {
              connection.query('SELECT total_payment, total FROM saleProduct WHERE sale_id = ?', [payment.sale_id], (error, result) => {
                if (error)
                  next(error);
                else {
                  console.log(result[0].total)
                  
                  console.log(parseFloat(result[0].total_payment) + parseFloat(payment.payment_amount))
                 
                  if (parseFloat(result[0].total) >= (parseFloat(result[0].total_payment) + parseFloat(payment.payment_amount))) 
                    next(null);
                  else
                    next("total_payment cannot be greater than total on saleProduct");
                }
              });
            },
            
            next => {
              connection.query('INSERT INTO payment SET ?', [payment], (error, result) => {
                if (error)
                  next(error);
                else {
                  next(null);
                }
              });
            },
  
            next => {
              connection.query('SELECT customer_id FROM saleProduct WHERE sale_id = ?', [payment.sale_id], (error, result) => {

                console.log("customer_id", result);

                if (error)
                  next(error);
                else
                  next(null, result[0].customer_id);
              });
            },
            
            (customer_id, next) => {
              console.log("customer_id en sig cb", customer_id);
              connection.query('UPDATE customer SET balance = balance - ? WHERE customer_id = ?', [payment.payment_amount,customer_id], (error, result) => {
                if (error)
                  next(error);
                else
                  next(null);
              });
            },

            next => {
              connection.query(`UPDATE saleProduct SET total_payment = total_payment + ? WHERE sale_id = ?`, [payment.payment_amount ,payment.sale_id], (error, result) => {
                if (error)
                  next(error);
                else {
                  next(null, "success");
                }
              });
            }
          ],
            (err, items) => {
              if (err)
                return connection.rollback(() => {
                  console.log(err);
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
  } else
      return cb('Connection refused');
}

Payment.response = (res, error, data) => {
  if (error) {
    // Save log in file
    logger.error(`Error on customer: ${JSON.stringify(error)}`)
    // Save log in DB
    error.message = 'Error on payment';
    Pool.log( error )    
    res.status(500).json(error);
  } else
      res.status(200).json(data);
}
  
  module.exports = Payment;