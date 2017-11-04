
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
    sp.sale_id, sp.customer_id, sp.sale_date, c.name AS customer_name, c.reference AS customer_reference, c.whatsapp AS customer_whatsapp, sp.employee_id, 
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





-- <<< Get the bill from a customer, can be sales in debt, settled sales or both.>>>
DELIMITER $$
DROP PROCEDURE IF EXISTS accountStatus$$
CREATE PROCEDURE `accountStatus`(
	IN debt VARCHAR(50),
	IN from_date VARCHAR(50),
	IN customer_id VARCHAR(50)
)
BEGIN
		DECLARE initialQuery VARCHAR(500) DEFAULT 'SELECT sp.sale_id AS Sale_sale_id, sp.customer_id, c.name, sp.sale_date, sp.total, p.payment_id, p.payment_date, p.payment_amount FROM saleProduct AS sp INNER JOIN payment AS p ON p.sale_id = sp.sale_id INNER JOIN customer AS c ON c.customer_id = sp.customer_id WHERE sp.type = ''CRÉDITO'' AND sp.sale_date >= ? AND sp.customer_id = ?';
 		CASE debt
			WHEN 'DEBT' THEN
				SET initialQuery = CONCAT(initialQuery, ' AND sp.total_payment < sp.total '); 

			WHEN 'SETTLED' THEN
				SET initialQuery = CONCAT(initialQuery, ' AND sp.total_payment = sp.total ');
			
			WHEN 'ALL' THEN
				SET initialQuery = initialQuery;
				
			ELSE
				SET initialQuery = initialQuery; 
				
		END CASE;

		SET initialQuery = CONCAT(initialQuery, ' ORDER BY Sale_sale_id');

		SET @dynamic_query = initialQuery;
		SET @fromDate = from_date;
		SET @customerId = customer_id;
		
		PREPARE stmt FROM @dynamic_query;
		EXECUTE stmt USING @fromDate, @customerId;
		DEALLOCATE PREPARE stmt;
END$$





-- <<< Debug query.>>>
DELIMITER $$
CREATE PROCEDURE debug_msg(enabled INTEGER, msg VARCHAR(1000))
BEGIN
  IF enabled THEN BEGIN
    select concat('*', msg) AS '* DEBUG:';
  END; END IF;
END $$


--- <<< DOT NOT USE THIS STORED PROCEDURE FOR PRODUCTION >>>
DELIMITER $$
USE flex_admin$$
DROP PROCEDURE IF EXISTS procDropAllTables $$
 
CREATE PROCEDURE procDropAllTables()
 
BEGIN
    DECLARE table_name VARCHAR(255);
    DECLARE end_of_tables INT DEFAULT 0;

    DECLARE cur CURSOR FOR
        SELECT t.table_name 
        FROM information_schema.tables t 
        WHERE t.table_schema = DATABASE() AND t.table_type='BASE TABLE';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET end_of_tables = 1;

    SET FOREIGN_KEY_CHECKS = 0;
    OPEN cur;

    tables_loop: LOOP
        FETCH cur INTO table_name;

        IF end_of_tables = 1 THEN
            LEAVE tables_loop;
        END IF;

        SET @s = CONCAT('DROP TABLE IF EXISTS ' , table_name);
        PREPARE stmt FROM @s;
        EXECUTE stmt;

    END LOOP;
  
    CLOSE cur;
    SET FOREIGN_KEY_CHECKS = 1;
END$$