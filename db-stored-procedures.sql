
-- 1.- Get list of customers.
DELIMITER $$

CREATE PROCEDURE `getCustomers`()
BEGIN
  SELECT * FROM customer;
END

-- 2.- Get the list of sales that has not been paid.
DELIMITER $$

CREATE PROCEDURE `salesToPay`()
BEGIN
  SELECT 
    sp.sale_id, sp.customer_id, c.name AS customer_name, sp.employee_id, 
    e.name AS employee_name, sp.subtotal, sp.discount, sp.total, sp.total_payment
  FROM saleProduct AS sp
  INNER JOIN customer AS c ON c.customer_id = sp.customer_id
  INNER JOIN employee as e ON e.employee_id = sp.employee_id
  WHERE sp.total_payment < sp.total;
END

-- 3.- Get list of products.
DELIMITER $$

CREATE PROCEDURE `getProducts`()
BEGIN
  SELECT * FROM product;
END
