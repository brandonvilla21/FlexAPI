
-- <<<1.- Get list of customers.>>>
DELIMITER $$

CREATE PROCEDURE `getCustomers`()
BEGIN
  SELECT * FROM customer;
END





-- <<<2.- Get the list of sales that has not been paid.>>>
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





-- <<<3.- Get list of products.>>>
DELIMITER $$

CREATE PROCEDURE `getProducts`()
BEGIN
  SELECT * FROM product;
END





-- <<<4.- Sales history to/by an {model} in a period. Model could be Employee or Customer.>>>
DELIMITER $$
-- fromDate: The initial date for WHERE statement.
-- toDate: The final date for WHERE statement.
-- column_id: Could be customer_id or employee_id.
-- id: The id that will be compared on WHERE statement.
CREATE PROCEDURE `salesHistoryByColumnInAPeriod`(
  IN fromDate DATE, 
  IN toDate DATE, 
  IN column_id VARCHAR(50), 
  IN id INT)

BEGIN

	SET @from_date = fromDate;
	SET @to_date = toDate;
	SET @id = id;
	SET @dynamic_query = CONCAT('
	SELECT s.sale_id, s.sale_date, s.type, s.state, s.subtotal, s.discount, s.total, s.total_payment,
		   c.name AS customer_name, c.lastname AS customer_lastname, 
       e.name AS employee_name, e.lastname AS employee_lastname
	FROM saleproduct s
	INNER JOIN customer c ON c.customer_id = s.customer_id
	INNER JOIN employee e ON e.employee_id = s.employee_id
	WHERE (s.sale_date BETWEEN ? AND ? ) AND s.', column_id, ' = ?');

	PREPARE stmt FROM @dynamic_query;
	EXECUTE stmt USING @from_date, @to_date, @id;
	DEALLOCATE PREPARE stmt;

END
