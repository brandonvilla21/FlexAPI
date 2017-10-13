
-- 1.- Get list of customers.
DELIMITER $$

CREATE PROCEDURE `getCustomers`()
BEGIN
  SELECT * FROM customer;
END





