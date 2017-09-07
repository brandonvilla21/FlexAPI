const conn = require('../config/db-connection');
let Product = {};

Product.all = cb => {
    if (conn) {
        const sql = "SELECT * FROM product";
        conn.query(sql, (error, rows) => {
            if(error) return cb(error);
            return cb(null, rows);
        });
    }
    else
        return cb("Connection refused");
    
}


Product.findById = (id, cb) => {
    if (conn) {
        conn.query("SELECT * FROM product WHERE product_id = ?", [id], (error, row) => {
            if (error) return cb(error);
            return cb(null, row);
        })
    }
}

Product.insert = (product, cb) => {
    if(conn) {
        conn.beginTransaction( err => {
            if (err) return cb( err );
            conn.query('INSERT INTO product SET ?', [product], (error, result) => {
                if(error) 
                    return conn.rollback( () => {
                        return cb(error);
                    });

                conn.commit( err => {
                    if (error)
                        return conn.rollback( () => {
                            return cb(error);
                        });
                    console.log("Success!");
                    return cb(null, result.insertId);
                });
            });
        });
    } else
        return cb('Connection refused');
}

Product.update = (product, cb) => {
    
    if ( connection ) {
        connection.beginTransaction( error => {
            if ( error )
                return cb( error );

            connection.query(
                `UPDATE product SET description = ?, brand = ?, flavor = ?, expiration_date = ?, sale_price = ? 
                 buy_price = ?, existence = ?, max = ?, min = ?, WHERE product_id = ?`
                ,
                [product.description, product.brand, product.flavor, product.expiration_date,
                 product.sale_price, product.buy_price, product.existence, product.max, product.min, 
                 product.product_id], (error, result) => {
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

Product.remove = (id, cb) => {
    if(conn) {
        conn.query('DELETE FROM product WHERE product_id = ?', [id], (error, result) => {
            if(error) return cb('An error has happened while deleting table');
            return cb(null, "Product deleted!");
        });
    }
}

Product.response = (res, error, data) => {
    if(error) 
        res.status(500).json(error);
    else 
        res.status(200).json(data);
}

module.exports = Product;
