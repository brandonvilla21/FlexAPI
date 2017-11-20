-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Nov 19, 2017 at 04:15 AM
-- Server version: 5.6.35
-- PHP Version: 7.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `flex_admin`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `accountStatus` (IN `debt` VARCHAR(50), IN `from_date` VARCHAR(50), IN `customer_id` VARCHAR(50))  BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `debug_msg` (`enabled` INTEGER, `msg` VARCHAR(1000))  BEGIN
  IF enabled THEN BEGIN
    select concat('*', msg) AS '* DEBUG:';
  END; END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getCustomers` ()  BEGIN
  SELECT * FROM customer;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getPaymentsBySaleId` (IN `saleId` INT)  BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getProducts` ()  BEGIN
  SELECT * FROM product;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getProductsWMinExistence` ()  BEGIN
	SELECT * FROM product WHERE existence <= min;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getTableData` (IN `tbl_name` VARCHAR(50))  BEGIN

	SET @query = CONCAT('SELECT * FROM ', tbl_name);

	PREPARE stmt FROM @query;
	
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `procDropAllTables` ()  BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `purchaseHistoryByColumnInAPeriod` (IN `fromDate` DATE, IN `toDate` DATE, IN `column_id` VARCHAR(20), IN `id` INT)  BEGIN
	DECLARE initialQuery VARCHAR(500) DEFAULT 'SELECT pp.purchase_id, pp.purchase_date, pp.subtotal, 
					   pp.discount, pp.total, p.name AS provider_name, p.description provider_description
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `salesHistoryByColumnAndSaleTypeInAPeriod` (IN `fromDate` DATE, IN `toDate` DATE, IN `column_id` VARCHAR(20), IN `id` INT, IN `saleType` VARCHAR(50))  BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `salesHistoryByColumnInAPeriod` (IN `fromDate` DATE, IN `toDate` DATE, IN `column_id` VARCHAR(50), IN `id` INT)  BEGIN

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

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `salesToPay` ()  BEGIN
  SELECT 
    sp.sale_id, sp.customer_id, sp.sale_date, c.name AS customer_name, c.reference AS customer_reference, c.whatsapp AS customer_whatsapp, sp.employee_id, 
    e.name AS employee_name, sp.subtotal, sp.discount, sp.total, sp.total_payment
  FROM saleProduct AS sp
  INNER JOIN customer AS c ON c.customer_id = sp.customer_id
  INNER JOIN employee as e ON e.employee_id = sp.employee_id
  WHERE sp.total_payment < sp.total;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customer_id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `lastname` varchar(50) DEFAULT NULL,
  `reference` varchar(50) DEFAULT NULL,
  `whatsapp` varchar(15) DEFAULT NULL,
  `facebook` varchar(50) DEFAULT NULL,
  `balance` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customer_id`, `name`, `lastname`, `reference`, `whatsapp`, `facebook`, `balance`) VALUES
(1, 'Juan', 'Pérez', 'El señor de los quesos', '3412345433', 'jperez', 5200),
(2, 'Karin', 'Zepeda', 'Ninguna', '341234567', 'karin', 4000),
(3, 'JOSE', 'MARTINES', 'REFERENCIA DE JOSE', '3411243193', 'FACE', 5600),
(4, 'Brandon', 'VIlla', 'Alto', '3411361316', 'brandon.villa.lml', 7400);

-- --------------------------------------------------------

--
-- Table structure for table `devolution`
--

CREATE TABLE `devolution` (
  `devolution_id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `devolution_date` date DEFAULT NULL,
  `total_returned` float DEFAULT NULL,
  `concept` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `devolution`
--

INSERT INTO `devolution` (`devolution_id`, `sale_id`, `employee_id`, `devolution_date`, `total_returned`, `concept`) VALUES
(1, 1, 1, '2017-09-24', 3300, 'No le agradaron las proteinas'),
(2, 2, 2, '2017-09-25', 10210, 'Va a cambiar los productos en la siguiente venta.'),
(3, 6, 3, '2017-09-25', 2600, 'No le gustaron'),
(4, 7, 1, '2017-09-25', 3800, 'Va a cambiar los productos. gg');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `employee_id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `lastname` varchar(50) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `whatsapp` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`employee_id`, `name`, `lastname`, `address`, `whatsapp`) VALUES
(1, 'Juan', 'Moreno', 'Juan ', '34112334'),
(2, 'EMPLEADO 123', 'APELLIDO DE EMPLEADO', 'DOMICILIO 123', '3411243193'),
(3, 'Juanito', 'Alvarez', 'Ogazon #394', '3411567898');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `payment_amount` float DEFAULT NULL,
  `payment_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `sale_id`, `employee_id`, `payment_amount`, `payment_date`) VALUES
(1, 1, 2, 400, '2017-10-02'),
(2, 2, 2, 200, '2017-10-04'),
(3, 2, 1, 100, '2017-10-04'),
(4, 5, 2, 200, '2017-10-06'),
(5, 5, 2, 400, '2017-10-06'),
(6, 6, 2, 600, '2017-10-06'),
(7, 2, 2, 4300, '2017-10-13'),
(8, 8, 1, 200, '2017-10-23');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `product_id` int(11) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `flavor` varchar(50) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `sale_price` float DEFAULT NULL,
  `buy_price` float DEFAULT NULL,
  `existence` int(11) DEFAULT NULL,
  `max` int(11) DEFAULT NULL,
  `min` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `description`, `brand`, `flavor`, `expiration_date`, `sale_price`, `buy_price`, `existence`, `max`, `min`) VALUES
(1, 'GOLD STANDARD 100% WHEY 5LB', 'ON', 'CHOCOLATE', '2018-09-01', 1000, 1100, 32, 15, 3),
(16, 'NITRO TECH', 'Marca', 'Sabor', '2005-05-05', 200, 200, 6, 10, 1),
(17, 'BHP ULTRA', 'BHP ULTRA', 'VAINILLA', '2018-06-15', 800, 750, 8, 10, 2),
(18, 'CREATINE ULTRA', 'BHP ULTRA', 'UNFLAVORED', '2018-06-15', 800, 700, 4, 10, 2),
(19, 'GLUTAMINE ULTRA', 'BHP ULTRA', 'UNFLAVORED', '2018-06-15', 800, 700, 4, 10, 2),
(20, 'PROTEIN ULTRA', 'BHP ULTRA', 'VAINILLA', '2018-06-15', 800, 700, -16, 10, 2),
(21, 'asd', 'BHN', 'asd', '2017-09-13', 1, 1, -9, 1, 1),
(22, 'PRODUCTO 11', 'MUSCLE PHARM', 'VAINILLA', '2017-12-08', 1000, 500, 8, 40, 10),
(23, 'Nuevo producto mágico', 'MUSCLE TECH', 'CHOCOLATE', '2018-01-13', 1200, 1000, 5, 10, 1),
(24, 'algodon', 'algodon', 'algodon', '2002-02-02', 0, 100, 5, 100, 5),
(25, 'algodon', 'algodon', 'algodon', '2002-02-02', 0, 100, 5, 100, 5),
(26, 'Proteina de suero de leche', 'ON', 'Chocolate', '2019-01-01', 1200, 1190, 5, 15, 2);

-- --------------------------------------------------------

--
-- Table structure for table `product_purchaseProduct`
--

CREATE TABLE `product_purchaseProduct` (
  `purchase_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `price` float DEFAULT NULL,
  `amount` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product_purchaseProduct`
--

INSERT INTO `product_purchaseProduct` (`purchase_id`, `product_id`, `price`, `amount`) VALUES
(1, 1, 1000, 10),
(1, 16, 200, 5),
(2, 1, 1100, 7),
(2, 17, 750, 4);

-- --------------------------------------------------------

--
-- Table structure for table `product_saleProduct`
--

CREATE TABLE `product_saleProduct` (
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `price` float DEFAULT NULL,
  `amount` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `product_saleProduct`
--

INSERT INTO `product_saleProduct` (`sale_id`, `product_id`, `price`, `amount`) VALUES
(1, 1, 1000, 4),
(1, 20, 800, 2),
(2, 1, 1000, 3),
(2, 20, 800, 2),
(3, 16, 200, 3),
(4, 17, 800, 1),
(4, 22, 1000, 2),
(5, 1, 1000, 3),
(5, 20, 800, 2),
(6, 1, 1000, 2),
(6, 20, 800, 2),
(7, 16, 200, 1),
(7, 20, 800, 3),
(8, 1, 1000, 4),
(8, 20, 800, 1);

-- --------------------------------------------------------

--
-- Table structure for table `provider`
--

CREATE TABLE `provider` (
  `provider_id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `contact` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `provider`
--

INSERT INTO `provider` (`provider_id`, `name`, `description`, `contact`, `email`, `phone`) VALUES
(1, 'Suplementos de Alemania', 'Venta de proteinas alemanas', 'Contacto', 'alemanes@alemania.com', '4132345'),
(2, 'Juan', 'Juan el vendedor de ciclos', 'El mismo', 'juan@gym.com', '4123445'),
(3, 'Empresa distribuidora de shakers', 'El de los shakers', 'Marcos Barrera', 'shakers@gmail.com', '4123456'),
(4, 'PROVEDOR 123', '123', 'CONTACTO 123', '123@GMAIL.COM', '4123456');

-- --------------------------------------------------------

--
-- Table structure for table `purchaseProduct`
--

CREATE TABLE `purchaseProduct` (
  `purchase_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `purchase_date` date DEFAULT NULL,
  `subtotal` float DEFAULT NULL,
  `discount` float DEFAULT NULL,
  `total` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `purchaseProduct`
--

INSERT INTO `purchaseProduct` (`purchase_id`, `provider_id`, `purchase_date`, `subtotal`, `discount`, `total`) VALUES
(1, 1, '2017-09-18', 11000, 1100, 12100),
(2, 1, '2017-09-18', 10700, 1070, 9630);

-- --------------------------------------------------------

--
-- Table structure for table `saleProduct`
--

CREATE TABLE `saleProduct` (
  `sale_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `sale_date` date DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `state` varchar(30) DEFAULT NULL,
  `subtotal` float DEFAULT NULL,
  `discount` float DEFAULT NULL,
  `total` float DEFAULT NULL,
  `total_payment` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `saleProduct`
--

INSERT INTO `saleProduct` (`sale_id`, `customer_id`, `employee_id`, `sale_date`, `type`, `state`, `subtotal`, `discount`, `total`, `total_payment`) VALUES
(1, 1, 2, '2017-10-02', 'CRÉDITO', 'REGISTRADO', 5600, 0, 5600, 400),
(2, 4, 2, '2017-10-04', 'CRÉDITO', 'REGISTRADO', 4600, 0, 4600, 4600),
(3, 4, 3, '2017-10-04', 'CONTADO', 'REGISTRADO', 600, 0, 600, 0),
(4, 4, 2, '2017-10-04', 'CRÉDITO', 'REGISTRADO', 2800, 0, 2800, 0),
(5, 2, 2, '2017-10-06', 'CRÉDITO', 'REGISTRADO', 4600, 0, 4600, 600),
(6, 3, 2, '2017-10-06', 'CRÉDITO', 'REGISTRADO', 3600, 0, 3600, 600),
(7, 3, 1, '2017-10-06', 'CRÉDITO', 'REGISTRADO', 2600, 0, 2600, 0),
(8, 4, 3, '2017-10-23', 'CRÉDITO', 'REGISTRADO', 4800, 0, 4800, 200);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(80) NOT NULL,
  `password` binary(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `email`, `password`) VALUES
(1, 'brandonvilla', 'brandon@gmail.com', 0x243261243130246737435477775a746133544a67782e54434f4e70332e4f395346576a5267736d685a547a6b5357745a514f43785436396a65594161),
(2, 'Derekvilla22', 'derek@gmail.com', 0x2432612431302478683474702e2f5433476b49576c4e4373784c7379656d3839696c734e35345939306e724e6a796e4262392f4f762e477362564e71),
(8, 'Macos', 'marcos@gmail.com', 0x2432612431302470676f4d2e387365466c3473462f39787442562e432e4445524b42746148306545545954357a396d6963767a58734373456b505669),
(9, 'Osiris', 'osiris@gmail.com', 0x243261243130244d7a513172497a3876646b4834725662786b63617a2e774136324b6a4754636f67476c507276326e5961394f48495065383776534f),
(12, 'Emmanuel', 'emmanuel@gmail.com', 0x243261243130246a646f6946532f77736a427a564a44347561796b44752f5657417437762e62595055673742725350452e374559717a307850336c53),
(13, 'test', 'test@gmail.com', 0x24326124313024756953647645715051654d46316158504e424b68522e696a426f586a4e39546552584d506b78356957364e4956422e3744366d542e),
(14, 'Brandon', 'brandon', 0x243261243130246578476e6f4f4a646b7451694a4e5178576934704a4f622e46517776785a67426537314c57336d55745871344e4a34636343313257),
(26, 'Juan', 'juan@gmail.com', 0x24326124313024515a614333715457527a65674c2e6f65692f6b7534656b79384f5675726d537957444b4e73745950394a30366c4f687a34694a684f),
(27, 'Pedro', 'pedro@gmail.com', 0x243261243130242e4d6c3639484d475273596a4f767657714e794d48654d504f45645762727862786a4566396e762f545176664f536a32654b424257),
(28, 'Ana', 'ana@gmail.com', 0x243261243130244f49593152656958796c6758682e347458746b30532e57664d41367862533346524b304a4b635679435a53576b5a442f724c5a6c61),
(29, 'Fer', 'fer@gmail.com', 0x24326124313024636b54322e4a484b643431696b7150484959516a37757a5a6c51456b754c584b32573674456e66514b78712e4a4852445762764d71),
(30, 'Migue', 'migue@gmail.com', 0x243261243130246f74595268565544476a326745584d534e704169726572766949676d7a32514867444b464f32662e2f52574d456436574437715836),
(31, 'Monse', 'monse@gmail.com', 0x24326124313024316e52706e6d434c685337776f51704a4545584d2e2e374635562f51435a6e744930694149344236766d50447a7a676577536f7653),
(32, 'Diego', 'diego@gmail.com', 0x2432612431302431354876753658556146554a497235415976694b486538466c486d2e482e45616e714e485830335846514838384549482e5047456d);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `devolution`
--
ALTER TABLE `devolution`
  ADD PRIMARY KEY (`devolution_id`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`employee_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `product_purchaseProduct`
--
ALTER TABLE `product_purchaseProduct`
  ADD PRIMARY KEY (`purchase_id`,`product_id`);

--
-- Indexes for table `product_saleProduct`
--
ALTER TABLE `product_saleProduct`
  ADD PRIMARY KEY (`sale_id`,`product_id`);

--
-- Indexes for table `provider`
--
ALTER TABLE `provider`
  ADD PRIMARY KEY (`provider_id`);

--
-- Indexes for table `purchaseProduct`
--
ALTER TABLE `purchaseProduct`
  ADD PRIMARY KEY (`purchase_id`);

--
-- Indexes for table `saleProduct`
--
ALTER TABLE `saleProduct`
  ADD PRIMARY KEY (`sale_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `devolution`
--
ALTER TABLE `devolution`
  MODIFY `devolution_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;
--
-- AUTO_INCREMENT for table `provider`
--
ALTER TABLE `provider`
  MODIFY `provider_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `purchaseProduct`
--
ALTER TABLE `purchaseProduct`
  MODIFY `purchase_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `saleProduct`
--
ALTER TABLE `saleProduct`
  MODIFY `sale_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;