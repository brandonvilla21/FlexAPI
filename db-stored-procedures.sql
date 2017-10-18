
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





-- <<<4.- Sales history to/by a {model} and by a saleType in a period. Model could be Employee or Customer.>>>
DELIMITER $$
-- fromDate: The initial date for WHERE statement.
-- toDate: The final date for WHERE statement.
-- column_id: Could be `customer_id` or `employee_id` or `all`.
-- id: The id that will be compared on WHERE statement.
-- saleType: Could be `CONTADO` or `CRÉDITO.
DROP PROCEDURE IF EXISTS salesHistoryByColumnAndSaleTypeInAPeriod$$
CREATE PROCEDURE `salesHistoryByColumnAndSaleTypeInAPeriod`(
	  IN fromDate DATE, 
	  IN toDate DATE, 
	  IN column_id VARCHAR(20), 
	  IN id INT,
	  IN saleType VARCHAR(50)  
  )
  
  
BEGIN
	DECLARE initialQuery VARCHAR(500) DEFAULT 'SELECT s.sale_id, s.sale_date, s.type, s.state, s.subtotal, s.discount, s.total, s.total_payment,
		   c.name AS customer_name, c.lastname AS customer_lastname,  
           e.name AS employee_name, e.lastname AS employee_lastname
		   FROM saleProduct s 
           INNER JOIN customer c ON c.customer_id = s.customer_id 
           INNER JOIN employee e ON e.employee_id = s.employee_id 
           WHERE (s.sale_date BETWEEN ? AND ? )';

	CASE saleType
		WHEN 'CRÉDITO' THEN
			SET initialQuery = CONCAT(initialQuery, ' AND s.type = ''CRÉDITO'''); 

		WHEN 'CONTADO' THEN
			SET initialQuery = CONCAT(initialQuery, ' AND s.type = ''CONTADO''');
			
		ELSE
			SET initialQuery = initialQuery;
			
	END CASE;
	
	SET @from_date = fromDate;
	SET @to_date = toDate;
	SET @id = id;
	
	IF (column_id = 'customer_id' OR column_id = 'employee_id') THEN
		SET initialQuery = CONCAT(initialQuery, ' AND s.', column_id, ' = ? ');
        SET @dynamic_query = initialQuery;
        PREPARE stmt FROM @dynamic_query;
		EXECUTE stmt USING @from_date, @to_date, @id;
		DEALLOCATE PREPARE stmt;
	
    ELSE
		SET @dynamic_query = initialQuery;
		PREPARE stmt FROM @dynamic_query;
		EXECUTE stmt USING @from_date, @to_date;
		DEALLOCATE PREPARE stmt;
        
  END IF;


END$$





-- <<< Get the list of products having the minimum or less than minimum existence.>>>

DELIMITER $$
CREATE PROCEDURE `getProductsWMinExistence`()
BEGIN
	SELECT * FROM product WHERE existence <= min;
END





-- <<< Get the list of a table set by parameter.>>>

DELIMITER $$

CREATE PROCEDURE `getTableData`(
  IN tbl_name VARCHAR(50) )

BEGIN
	SET @query = CONCAT('SELECT * FROM ', tbl_name);

	PREPARE stmt FROM @query;
	
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
END




-- <<< Get the list of payments by sale_id.>>>

DELIMITER $$

CREATE PROCEDURE `getPaymentsBySaleId`(
	IN saleId INT
)

BEGIN
	SET @sale_id = saleId;
	SET @query = CONCAT('
	SELECT 
		p.`payment_id`, p.`sale_id`, p.`employee_id` , e.`name` AS employee_name, p.`payment_amount`,
		p.`payment_date`

	FROM payment AS p
	INNER JOIN employee AS e ON e.`employee_id` = p.`employee_id`
	INNER JOIN saleProduct AS sp ON sp.`sale_id` = p.`sale_id`
	WHERE sp.`sale_id` = ?');
	
	PREPARE stmt FROM @query;
	EXECUTE stmt USING @sale_id;
	DEALLOCATE PREPARE stmt;
END
  



-- <<<5.- Purchase history by a {model} in a period. Model could be Provider, otherwise it will return all the records.>>>
DELIMITER $$
-- fromDate: The initial date for WHERE statement.
-- toDate: The final date for WHERE statement.
-- column_id: Could be `provider_id. If column_id is not provided,
-- 			  the procedure will return all the records that matches against the dates.
-- id: The id that will be compared on WHERE statement.

DROP PROCEDURE IF EXISTS purchaseHistoryByColumnInAPeriod$$
CREATE PROCEDURE `purchaseHistoryByColumnInAPeriod`(
	  IN fromDate DATE, 
	  IN toDate DATE, 
	  IN column_id VARCHAR(20), 
	  IN id INT  
  )
  
  
BEGIN
	DECLARE initialQuery VARCHAR(500) DEFAULT 'SELECT pp.purchase_id, pp.purchase_date, pp.subtotal, 
					   pp.discount, pp.total, p.name, p.description
					   FROM purchaseProduct pp
					   INNER JOIN provider p ON p.provider_id = pp.provider_id
					   WHERE (pp.purchase_date BETWEEN ? AND ? )';

	SET @from_date = fromDate;
	SET @to_date = toDate;
	SET @id = id;
	
	IF (column_id = 'provider_id') THEN
		SET initialQuery = CONCAT(initialQuery, ' AND pp.', column_id, ' = ? ');
        SET @dynamic_query = initialQuery;
        PREPARE stmt FROM @dynamic_query;
		EXECUTE stmt USING @from_date, @to_date, @id;
		DEALLOCATE PREPARE stmt;
	
  ELSE
		SET @dynamic_query = initialQuery;
		PREPARE stmt FROM @dynamic_query;
		EXECUTE stmt USING @from_date, @to_date;
		DEALLOCATE PREPARE stmt;
        
  END IF;


END$$

