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
            if (err) throw err;
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

// Product.update = (product, callback) => {
//     if(conn) {
//         conn.query(
//             'UPDATE product SET name = ?, price = ?, description = ? WHERE id = ?',
//             [product.name, product.price, product.description, product.id],
//             (error, result) => {
//                 if(error) {
//                     return callback('Error actualizando producto');
//                 }
//                 return callback(null, "Producto actualizado");
//             }
//         )
//     }
// }

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
