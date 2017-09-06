
CREATE TABLE product (
    product_id INT NOT NULL AUTO_INCREMENT,
    description VARCHAR(100),
    brand VARCHAR(50),
    flavor VARCHAR(50),
    expiration_date DATE,
    sale_price FLOAT,
    buy_price FLOAT,
    existence INT,
    max INT,
    min INT,
    PRIMARY KEY (product_id)
);

CREATE TABLE employee (
    employee_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),
    lastname VARCHAR(50),
    address VARCHAR(100),
    whatsapp VARCHAR(15),
    PRIMARY KEY (employee_id)
    
);

CREATE TABLE customer (
    customer_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),
    lastname VARCHAR(50),
    reference VARCHAR(50),
    whatsapp VARCHAR(15),
    facebook VARCHAR(50),
    balance FLOAT,
    PRIMARY KEY (customer_id)
);

CREATE TABLE provider (
    provider_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),    
    description VARCHAR(100),
    contact VARCHAR(50),
    email VARCHAR(50),
    phone VARCHAR(15),
    PRIMARY KEY (provider_id)
);

CREATE TABLE productSale (
    sale_id INT NOT NULL AUTO_INCREMENT,
    customer_id INT NOT NULL,    
    employee_id INT NOT NULL,
    saleDate DATE,
    subtotal FLOAT,
    discount FLOAT,
    total FLOAT,
    totalPayment FLOAT
    PRIMARY KEY (sale_id)
);

CREATE TABLE payment (
    payment_id INT NOT NULL AUTO_INCREMENT,
    sale_id INT NOT NULL,
    paymentAmount FLOAT,
    paymentDate DATE,
    PRIMARY KEY (payment_id)
);
