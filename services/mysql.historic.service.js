const connectionH = require('../config/db-historic-connection');
const connectionD = require('../config/db-connection');
const values = require('object.values');
const { each, waterfall } = require('async');


const MySQLHistoricService = {}

MySQLHistoricService.generateHistoric = (startDate, endDate, next) => {
    connectionH.beginTransaction( async error => {
        if ( error ) return next(error)
        try {
            await truncateCatalogs();        
            await setTableData('customer');
            await setTableData('employee');
            await setTableData('product');
            await setTableData('provider');
            await setTableData('user');
            await setTableDataWithDate('devolution', 'devolution_date', startDate, endDate);
            await deleteDevolutionData( startDate, endDate )
            await setPurchaseData(startDate, endDate)
            await setSaleData(startDate, endDate)
            connectionH.commit( error => {
                if ( error ) connectionH.rollback (() => next(error))
                connectionH.end()
                return next(null, 'Succes')
            })
        } catch (error) {
            connectionH.rollback (() => next(error))
        }

    })
}

const truncateCatalogs = () => {
    return new Promise( (resolve, reject) => {
        connectionH.query(`
            TRUNCATE TABLE customer;
            TRUNCATE TABLE employee;
            TRUNCATE TABLE product;
            TRUNCATE TABLE provider;
            TRUNCATE TABLE user;
        `, (error, result) => error ? reject(error) : resolve(result))
    })
}

const setTableData = ( tableName ) => {
    return new Promise ( (resolve, reject) => {
        connectionD.query('SELECT * FROM ??',[tableName], (error, resultD) => {
            if ( error ) return reject(error);

            const rows = resultD.map( row => values(row))

            connectionH.query(`
            INSERT INTO 
            ??
            VALUES ?`,
            [tableName, rows], (error, resultH) => {
                if ( error ) return reject( error )
                return resolve( resultH )
            })
        })
    })
}
const setTableDataWithDate = ( tableName, dateColumnName, startDate, lastDate ) => {
    return new Promise ( (resolve, reject) => {
        connectionD.query('SELECT * FROM ?? WHERE ?? BETWEEN ? AND ?',
        [tableName, dateColumnName, startDate, lastDate], (error, resultD) => {
            if ( error ) return reject(error);
            if (resultD.length > 0) {
                const rows = resultD.map( row => values(row))
                connectionH.query(`
                INSERT INTO 
                ??
                VALUES ?
                `,
                [tableName, rows], (error, resultH) => {
                    if ( error ) return reject( error )
                    return resolve( resultH )
                })
            } else
                resolve('Any column to insert')
        })
    })
}

const deleteDevolutionData = (startDate, lastDate) => {
    return new Promise( (resolve, reject) => {
        connectionD.query('DELETE FROM devolution WHERE devolution_date BETWEEN ? AND ?',
        [startDate, lastDate], (error, resultD) => {
            if ( error ) return reject(error);
            resolve( resultD )
        })
    })
}

const setPurchaseData = (startDate, lastDate) => {
    return new Promise ( (resolve, reject) => {
        waterfall([
            // Get the rows from purchaseProduct
            next => {
                connectionD.query(`
                SELECT * FROM purchaseProduct WHERE purchase_date BETWEEN ? AND ?`,
                [startDate, lastDate], (error, resultD) => {
                    if ( error ) next(error)
                    const rows = resultD.map( row => values(row))
                    next(null, rows)
                })
            },
            // Get the rows from product_purchaseProduct
            (purchaseRows, next) => {
                const ids = purchaseRows.map( row => row[0] )
                const productPurchaseRows = []
                const results = []
                results.push(purchaseRows)
                each(ids, (id, cb) => {
                    connectionD.query(`SELECT * FROM product_purchaseProduct WHERE purchase_id = ?`,
                    [id], (error, result) =>{
                        if ( error ) cb( error )
                        else {
                            const newRows = result.map( row => values(row))
                            newRows.forEach( row => {
                                productPurchaseRows.push( row )
                            });
                            cb()
                        }
                    })
                },
                // Callback of async.each
                error =>{
                    if ( error )
                        next(error)
                    else {
                        results.push(productPurchaseRows)
                        next(null, results)
                    }
                })
            },
            // Inserts in purchaseProduct (Historic)
            (results, next) => {
                if ( results[0].length > 0)
                    connectionH.query(`
                    INSERT INTO purchaseProduct
                    VALUES ?`,
                    [results[0]], (error, result) => error ? next(error) : next(null, results))
                else
                    next(null,results)
                
            },
            // Inserts in product_purchaseProduct (Historic)
            (results, next) => {
                if ( results[1].length > 0)                
                    connectionH.query(`INSERT INTO product_purchaseProduct VALUES ?`,
                    [results[1]], (error, result) => error ? next(error) : next(null, results))
                else
                    next(null, results)

            },
            // DELETE from purchaseProduct
            (results, next) => {
                connectionD.query(`DELETE FROM purchaseProduct WHERE purchase_date BETWEEN ? AND ?`,
                [startDate, lastDate], (error, result) => error ? next(error) : next(null, results))
            },
            // DELETE from product_purchaseProduct
            (results, next) => {
                const ids = results[0].map( row => row[0] )
                each(ids, (id, cb) => {
                    connectionD.query(`DELETE FROM product_purchaseProduct WHERE purchase_id = ?`,
                    [id], (error, result) => error ? cb(error) : cb())
                },
                // Callback of async.each
                error => error ? next(error) : next(null, results))
            }
        ],
        (error, result) => {
            if ( error ) return reject( error )
            return resolve( result )
        })
    })
}

const setSaleData = (startDate, lastDate) => {
    return new Promise( (resolve, reject) => {
        waterfall([
            // Get the rows from saleProduct
            next => {
                connectionD.query(`
                SELECT * FROM saleProduct
                WHERE sale_date BETWEEN ? AND ?
                AND (type = 'CONTADO' OR (type = 'CRÉDITO' AND total = total_payment))`,
                [startDate, lastDate], (error, resultD) => {
                    if ( error ) next(error)
                    const rows = resultD.map( row => values(row))
                    next(null, rows)
                })
            },
            // Get the rows from product_saleProduct
            (saleRows, next) => {
                const ids = saleRows.map( row => row[0] )
                const productSaleRows = []
                const results = []
                results.push(saleRows)
                each(ids, (id, cb) => {
                    connectionD.query(`SELECT * FROM product_saleProduct WHERE sale_id = ?`,
                    [id], (error, result) =>{
                        if ( error ) cb( error )
                        else {
                            const newRows = result.map( row => values(row))
                            newRows.forEach( row => {
                                productSaleRows.push( row )
                            });
                            cb()
                        }
                    })
                },
                // Callback of async.each
                error =>{
                    if ( error )
                        next(error)
                    else {
                        results.push(productSaleRows)
                        next(null, results)
                    }
                })
            },
            // Get the rows from payment
            (results, next) => {
                const ids = results[0].map( row => row[0] )
                const paymentRows = []
                each(ids, (id, cb) => {
                    connectionD.query(`SELECT * FROM payment WHERE sale_id = ?`,
                    [id], (error, result) =>{
                        if ( error ) cb( error )
                        else {
                            const newRows = result.map( row => values(row))
                            newRows.forEach( row => {
                                paymentRows.push( row )
                            });
                            cb()
                        }
                    })
                },
                // Callback of async.each
                error =>{
                    if ( error )
                        next(error)
                    else {
                        results.push(paymentRows)
                        next(null, results)
                    }
                })
            },
            // Inserts in saleProduct (Historic)
            (results, next) => {
                if ( results[0].length > 0 )
                    connectionH.query(`
                    INSERT INTO saleProduct
                    VALUES ?`,
                    [results[0]], (error, result) => error ? next(error) : next(null, results))
                else
                    next(null, results)
            },
            // Inserts in product_purchaseProduct (Historic)
            (results, next) => {
                if (results[1].length > 0)                
                    connectionH.query(`INSERT INTO product_saleProduct VALUES ?`,
                    [results[1]], (error, result) => error ? next(error) : next(null, results))
                else
                    next(null, results)
            },
            // Inserts in payment (Historic)
            (results, next) => {
                if (results[2].length > 0)                
                    connectionH.query(`INSERT INTO payment VALUES ?`,
                    [results[2]], (error, result) => error ? next(error) : next(null, results))
                else
                    next(null, results)
            },
            // DELETE from saleProduct
            (results, next) => {
                connectionD.query(`
                DELETE FROM saleProduct
                WHERE sale_date BETWEEN ? AND ?
                AND (type = 'CONTADO' OR (type = 'CRÉDITO' AND total = total_payment))`,
                [startDate, lastDate], (error, resultD) => error ? next(error) : next(null, results))
            },
            // DELETE from product_saleProduct
            (results, next) => {
                const ids = results[0].map( row => row[0] )
                each(ids, (id, cb) => {
                    connectionD.query(`DELETE FROM product_saleProduct WHERE sale_id = ?`,
                    [id], (error, result) => error ? cb(error): cb())
                },
                // Callback of async.each
                error => error ? next(error) : next(null, results))
            },
            // DELETE from payment
            (results, next) => {
                const ids = results[0].map( row => row[0] )
                each(ids, (id, cb) => {
                    connectionD.query(`DELETE FROM payment WHERE sale_id = ?`,
                    [id], (error, result) => error ? cb(error) : cb())
                },
                // Callback of async.each
                error => error ? next(error) : next(null, results))
            }
        ],
        (error, result) => {
            if ( error ) return reject( error )
            return resolve( result )

        })
    })
}
MySQLHistoricService.response = (res, error, data) => {
    if (error) 
      res.status(500).json({success: false, error: error});
    else
        res.status(200).json({sucess: true});
  }

module.exports = MySQLHistoricService;